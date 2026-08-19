import { useEffect, useState } from "react";
import { profile } from "../data/profile";
import "./WhatsAppButton.css";

const DEFAULT_MESSAGE = "Hi Aryan! I found your portfolio and I'd like to chat.";

// Normalizes a phone number like "+91-7482860774" into the digits-only
// format wa.me expects ("917482860774").
function toWhatsAppNumber(phone) {
  return (phone || "").replace(/[^\d]/g, "");
}

export default function WhatsAppButton() {
  const [settings, setSettings] = useState(null);

  // Pulls the live WhatsApp number from the backend (editable by the admin
  // in the dashboard) and falls back to the static profile number if the
  // API isn't reachable.
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || "";
    fetch(`${apiBase}/api/public/settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok && data.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  const number = toWhatsAppNumber(settings?.whatsapp || settings?.phone || profile.phone);

  function openWhatsApp() {
    const url = `https://wa.me/${number}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <button className="wa-fab" onClick={openWhatsApp} aria-label="Chat on WhatsApp">
      <WhatsAppIcon />
    </button>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" fill="currentColor">
      <path d="M16.02 3C9.4 3 4.02 8.38 4.02 15c0 2.35.66 4.54 1.8 6.42L4 29l7.76-1.78A11.9 11.9 0 0 0 16.02 27c6.62 0 12-5.38 12-12s-5.38-12-12-12Zm0 21.6a9.5 9.5 0 0 1-4.86-1.33l-.35-.2-4.6 1.05 1.08-4.48-.23-.37A9.55 9.55 0 1 1 25.57 15a9.56 9.56 0 0 1-9.55 9.6Zm5.24-7.15c-.29-.14-1.7-.84-1.96-.93-.26-.1-.46-.14-.65.14-.19.29-.75.93-.92 1.12-.17.19-.34.21-.63.07-.29-.14-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.6-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.65-1.57-.9-2.15-.24-.57-.48-.5-.65-.5h-.56c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.38s1.02 2.76 1.17 2.95c.14.19 2 3.06 4.86 4.29.68.29 1.21.47 1.62.6.68.22 1.3.19 1.79.11.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.24.17-1.37-.07-.12-.26-.19-.55-.34Z" />
    </svg>
  );
}
