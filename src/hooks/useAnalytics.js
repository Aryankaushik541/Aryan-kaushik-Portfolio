import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "";

// Fire-and-forget page view track.  Runs silently on every route change.
// Bots/crawlers are filtered server-side; no cookies or PII sent.
export default function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const referrer = document.referrer || "";
    fetch(`${API_BASE}/api/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location.pathname, referrer }),
    }).catch(() => {});
  }, [location.pathname]);
}
