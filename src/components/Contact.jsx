import { useState } from "react";
import { profile } from "../data/profile";
import useReveal from "../hooks/useReveal";
import SEO from "./SEO";
import "./Contact.css";

const API_BASE = import.meta.env.VITE_API_URL || "";
const initial  = { name: "", email: "", subject: "", message: "" };
const MAX_MESSAGE = 600;

export default function Contact({ standalone = false }) {
  const [form,   setForm]   = useState(initial);
  const [status, setStatus] = useState({ state: "idle", error: "" });
  const revealRef = useReveal();

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: "sending", error: "" });
    try {
      const res  = await fetch(`${API_BASE}/api/contact`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong.");
      setStatus({ state: "sent", error: "" });
      setForm(initial);
    } catch (err) {
      setStatus({ state: "error", error: err.message });
    }
  };

  return (
    <section id="contact">
      {standalone && (
        <SEO
          title="Contact"
          description="Get in touch with Aryan Kaushik for full-stack development roles, freelance MERN projects, or collaboration. Email, phone, GitHub, and LinkedIn available."
          path="/contact"
        />
      )}
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">~/contact</p>
            <h2>Let's build something</h2>
          </div>
        </div>

        <div className="contact-grid reveal" ref={revealRef}>
          <div>
            <p className="contact-intro">
              Open to full-stack roles and freelance MERN projects. Reach out directly, or
              use the form — it's wired to a live Express + MongoDB API.
            </p>
            <div className="contact-details">
              <a href={`mailto:${profile.email}`} className="contact-detail">
                <span className="contact-detail-icon" aria-hidden="true">✉</span>
                <span>
                  <span className="path-label">email</span> {profile.email}
                </span>
              </a>
              <a href={`tel:${profile.phone}`} className="contact-detail">
                <span className="contact-detail-icon" aria-hidden="true">☎</span>
                <span>
                  <span className="path-label">phone</span> {profile.phone}
                </span>
              </a>
              <a href={profile.links.github} target="_blank" rel="noreferrer" className="contact-detail">
                <span className="contact-detail-icon" aria-hidden="true">⌘</span>
                <span>
                  <span className="path-label">github</span> github.com/Aryankaushik541
                </span>
              </a>
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="contact-detail">
                <span className="contact-detail-icon" aria-hidden="true">in</span>
                <span>
                  <span className="path-label">linkedin</span> aryan-kaushik-811a99207
                </span>
              </a>
            </div>
          </div>

          {status.state === "sent" ? (
            <div className="card contact-success animate-fade-in-up">
              <div className="success-check" aria-hidden="true">
                <svg viewBox="0 0 52 52">
                  <circle className="success-check-circle" cx="26" cy="26" r="24" fill="none" />
                  <path className="success-check-mark" fill="none" d="M14 27l7 7 17-17" />
                </svg>
              </div>
              <p className="eyebrow">Message received</p>
              <p>Thanks for reaching out! I'll get back to you soon.</p>
              <button className="btn btn-ghost" onClick={() => setStatus({ state: "idle", error: "" })}>
                Send another
              </button>
            </div>
          ) : (
            <form className="card contact-form" onSubmit={onSubmit} noValidate>
              <div className="contact-row">
                <div className="field">
                  <label htmlFor="c-name">Name</label>
                  <input id="c-name" name="name" placeholder="Your name" value={form.name} onChange={onChange} required />
                </div>
                <div className="field">
                  <label htmlFor="c-email">Email</label>
                  <input id="c-email" name="email" placeholder="you@example.com" value={form.email} onChange={onChange} required type="email" />
                </div>
              </div>

              <div className="field">
                <label htmlFor="c-subject">Subject</label>
                <input id="c-subject" name="subject" placeholder="What's this about?" value={form.subject} onChange={onChange} />
              </div>

              <div className="field">
                <div className="field-label-row">
                  <label htmlFor="c-message">Message</label>
                  <span className={`char-count ${form.message.length > MAX_MESSAGE ? "over" : ""}`}>
                    {form.message.length}/{MAX_MESSAGE}
                  </span>
                </div>
                <textarea
                  id="c-message"
                  name="message"
                  placeholder="Tell me a bit about the project or role…"
                  rows={6}
                  maxLength={MAX_MESSAGE}
                  value={form.message}
                  onChange={onChange}
                  required
                />
              </div>

              {status.error && <p className="login-error contact-error">{status.error}</p>}

              <button className="btn btn-primary contact-submit" type="submit" disabled={status.state === "sending"}>
                {status.state === "sending" ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  <>Send Message <span className="btn-arrow">→</span></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
