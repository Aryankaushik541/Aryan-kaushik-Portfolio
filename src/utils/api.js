const API_BASE = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "portfolio_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

// ── Email OTP auth ────────────────────────────────────────────────────────
export async function requestOtp(email) {
  const res = await fetch(`${API_BASE}/api/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || "Could not send the code. Please try again.");
  }
  return data;
}

// ── AI chat streaming (Server-Sent Events) ───────────────────────────────
// Streams the assistant's reply token-by-token. `messages` is an array of
// { role: "user" | "assistant", content: string }.
export async function streamAiChat(messages, { files = [], onDelta, onDone, onError, signal }) {
  const token = getToken();
  const hasFiles = files.length > 0;
  const body = hasFiles ? new FormData() : JSON.stringify({ messages });
  if (hasFiles) {
    body.append("messages", JSON.stringify(messages));
    files.forEach((file) => body.append("files", file));
  }
  let res;
  try {
    res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: "POST",
      headers: {
        ...(hasFiles ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
      signal,
    });
  } catch (err) {
    onError?.(err.message || "Network error.");
    return;
  }

  if (res.status === 401 || res.status === 403) {
    clearToken();
    onError?.("Your session expired. Please sign in again.");
    return;
  }

  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    onError?.(data.error || "Something went wrong.");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "message";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        const raw = line.slice(6).trim();
        if (!raw) continue;
        let payload;
        try {
          payload = JSON.parse(raw);
        } catch {
          continue;
        }
        if (currentEvent === "delta") onDelta?.(payload.text);
        else if (currentEvent === "done") onDone?.();
        else if (currentEvent === "error") onError?.(payload.error || "AI error.");
      }
    }
  }
}

export async function verifyOtp(email, otp) {
  const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || "Invalid or expired code.");
  }
  return data;
}

// Authenticated JSON fetch for the admin dashboard. Throws with a readable
// message on non-2xx responses so callers can show it directly.
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 || res.status === 403) {
    clearToken();
  }

  if (!res.ok || data.ok === false) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}
