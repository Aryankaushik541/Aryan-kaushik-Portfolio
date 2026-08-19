import { useEffect, useRef, useState } from "react";
import { profile, skillGroups, featuredProjects, experience } from "../data/profile";
import "./ChatbotWidget.css";

const GREETING = `Hi! I'm ${profile.name.split(" ")[0]}'s assistant. Ask me about skills, projects, experience, or leave a message.`;

const QUICK_REPLIES = ["About", "Skills", "Projects", "Experience", "Contact"];
const SESSION_KEY = "portfolio_chat_session";

// Every visitor gets a stable random session id (kept in localStorage) so
// their conversation groups into one thread in the admin dashboard.
function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// Fire-and-forget: sends new messages to the backend so they show up live
// in the admin dashboard's Chat tab. Failures are silent — logging should
// never block or break the visitor's chat experience.
function logToServer(newMessages, visitorName) {
  if (!newMessages.length) return;
  const apiBase = import.meta.env.VITE_API_URL || "";
  fetch(`${apiBase}/api/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: getSessionId(),
      messages: newMessages,
      ...(visitorName ? { visitorName } : {}),
    }),
  }).catch(() => {});
}

// Simple keyword → answer rules. No external AI calls — everything below is
// generated from the same profile data that powers the rest of the site.
function buildReply(rawInput) {
  const input = rawInput.toLowerCase();

  if (/\b(hi|hello|hey|namaste)\b/.test(input)) {
    return "Hey there 👋 What would you like to know — skills, projects, experience, or how to get in touch?";
  }

  if (/(about|who|intro)/.test(input)) {
    return `${profile.summary}`;
  }

  if (/(skill|tech|stack|language)/.test(input)) {
    const lines = skillGroups.map((g) => `• ${g.label}: ${g.items.slice(0, 4).join(", ")}`);
    return `Here's the stack:\n${lines.join("\n")}`;
  }

  if (/(project|work|build|portfolio)/.test(input)) {
    const lines = featuredProjects.slice(0, 3).map((p) => `• ${p.name}`);
    return `A few things I've built:\n${lines.join("\n")}\n\nCheck the Projects page for the full list.`;
  }

  if (/(experience|job|intern|career)/.test(input)) {
    const lines = experience.map((e) => `• ${e.role} — ${e.org} (${e.period})`);
    return `Experience so far:\n${lines.join("\n")}`;
  }

  if (/(hire|available|opportunit|job offer)/.test(input)) {
    return "Yes, open to new opportunities! Use the WhatsApp button for the fastest reply, or leave your message below and it'll land directly in the inbox.";
  }

  if (/(contact|email|phone|reach|message|whatsapp)/.test(input)) {
    return `You can reach out at ${profile.email} or ${profile.phone}, or leave a message below and it'll go straight to the contact inbox.`;
  }

  return "I didn't quite catch that. Try one of the quick options below, or leave a message and I'll make sure it gets read.";
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: "bot", text: GREETING }]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("chat"); // "chat" | "leaveMessage"
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sendState, setSendState] = useState("idle"); // idle | sending | sent | error
  const bodyRef = useRef(null);
  const loggedGreeting = useRef(false);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, mode]);

  // Log the opening greeting once, the first time the widget is opened —
  // gives the admin dashboard a clean thread start.
  useEffect(() => {
    if (open && !loggedGreeting.current) {
      loggedGreeting.current = true;
      logToServer([{ from: "bot", text: GREETING }]);
    }
  }, [open]);

  function pushBotMessage(text) {
    setMessages((m) => [...m, { from: "bot", text }]);
    logToServer([{ from: "bot", text }]);
  }

  function handleSend(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((m) => [...m, { from: "user", text: trimmed }]);
    logToServer([{ from: "user", text: trimmed }]);
    setInput("");

    if (/(leave|talk to a human|real message|contact form)/.test(trimmed.toLowerCase())) {
      setMode("leaveMessage");
      return;
    }

    setTimeout(() => pushBotMessage(buildReply(trimmed)), 300);
  }

  function handleQuickReply(label) {
    if (label === "Contact") {
      setMessages((m) => [...m, { from: "user", text: "Contact" }]);
      setMode("leaveMessage");
      return;
    }
    handleSend(label);
  }

  async function submitMessage(e) {
    e.preventDefault();
    setSendState("sending");
    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiBase}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, subject: "Sent via site chatbot" }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error || "Failed to send.");

      setSendState("sent");
      const thanks = `Thanks, ${form.name.split(" ")[0] || "there"} — your message was sent. I'll get back to you soon.`;
      setMessages((m) => [...m, { from: "bot", text: thanks }]);
      logToServer([{ from: "bot", text: thanks }], form.name);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => {
        setMode("chat");
        setSendState("idle");
      }, 1800);
    } catch (err) {
      setSendState("error");
    }
  }

  return (
    <div className="chatbot-widget">
      {open && (
        <div className="chatbot-panel card animate-fade-in-up" role="dialog" aria-label="Chat with the site assistant">
          <div className="chatbot-header">
            <div className="chatbot-avatar">🤖</div>
            <div>
              <div className="chatbot-title">Site Assistant</div>
              <div className="chatbot-subtitle">Automated · answers from Aryan's profile</div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Close chat">
              ✕
            </button>
          </div>

          <div className="chatbot-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-bubble ${m.from}`}>
                {m.text.split("\n").map((line, j) => (
                  <span key={j}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            ))}

            {mode === "leaveMessage" && (
              <form className="chatbot-lead-form" onSubmit={submitMessage}>
                <input
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Your message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
                {sendState === "error" && <p className="chatbot-error">Couldn't send — try again.</p>}
                <button className="btn btn-primary" type="submit" disabled={sendState === "sending"}>
                  {sendState === "sending" ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>

          {mode === "chat" && (
            <>
              <div className="chatbot-quick-replies">
                {QUICK_REPLIES.map((label) => (
                  <button key={label} className="tag as-btn" onClick={() => handleQuickReply(label)}>
                    {label}
                  </button>
                ))}
              </div>
              <form
                className="chatbot-input-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message…"
                  aria-label="Type a message"
                />
                <button className="btn btn-primary" type="submit">
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <button
        className="chatbot-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat"
        aria-expanded={open}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
