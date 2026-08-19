import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { requestOtp, verifyOtp, setToken } from "../utils/api";
import SEO from "../components/SEO";
import "./Login.css";

const RESEND_SECONDS = 45;

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // "email" | "otp"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (step === "otp") otpInputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSendOtp(e) {
    e?.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await requestOtp(email.trim().toLowerCase());
      setStep("otp");
      setInfo("If this email has access, a 6-digit code has been sent to it.");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(err.message || "Could not send the code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await verifyOtp(email.trim().toLowerCase(), otp.trim());
      setToken(data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="login-section">
      <SEO title="Sign In" description="Sign in with a one-time email code." path="/login" />
      <div className="container login-container">
        <div className="card login-card animate-fade-in-up">
          <p className="eyebrow">~/login</p>

          {step === "email" ? (
            <form onSubmit={handleSendOtp}>
              <h1 className="login-title">Sign In</h1>
              <p className="login-sub">
                Enter your email. If it has access, we'll send you a one-time code.
              </p>

              <label className="login-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && <p className="login-error">{error}</p>}

              <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
                {loading ? "Sending…" : "Send Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
              <h1 className="login-title">Enter Code</h1>
              <p className="login-sub">
                We sent a 6-digit code to <strong>{email}</strong>.
              </p>

              <label className="login-label" htmlFor="otp">
                6-digit code
              </label>
              <input
                id="otp"
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="••••••"
                className="login-otp-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />

              {info && !error && <p className="login-info">{info}</p>}
              {error && <p className="login-error">{error}</p>}

              <button
                className="btn btn-primary login-btn"
                type="submit"
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying…" : "Verify & Sign In"}
              </button>

              <div className="login-actions-row">
                <button
                  type="button"
                  className="login-link-btn"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setError("");
                  }}
                >
                  ← Use a different email
                </button>
                <button
                  type="button"
                  className="login-link-btn"
                  disabled={cooldown > 0 || loading}
                  onClick={handleSendOtp}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
