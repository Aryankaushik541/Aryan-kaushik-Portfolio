import { Link } from "react-router-dom";
import { profile } from "../data/profile";
import ClearanceBadge from "./ClearanceBadge";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero" style={{ borderTop: "none" }}>
      <div className="container hero-grid">
        <div className="animate-fade-in-up">
          <p className="eyebrow">AVAILABLE FOR OPPORTUNITIES</p>
          <h1 className="hero-title">
            Aryan Kaushik — building secure, production-grade{" "}
            <span className="hero-accent">MERN</span> applications.
          </h1>
          <p className="hero-desc">
            <strong>Aryan Kaushik</strong> is a Full-Stack Developer &amp; Certified Ethical Hacker (CEH).{" "}
            {profile.summary}
          </p>

          <div className="hero-actions">
            <Link to="/projects" className="btn btn-primary">
              View Projects →
            </Link>
            <a href="#contact" className="btn btn-ghost">
              Get in Touch
            </a>
          </div>

          <div className="hero-links">
            <a href={profile.links.github} target="_blank" rel="noreferrer">
              github.com/Aryankaushik541
            </a>
            <span aria-hidden="true">·</span>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
              linkedin.com/in/aryan-kaushik
            </a>
          </div>
        </div>

        <div className="hero-side animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <ClearanceBadge />
        </div>
      </div>
    </section>
  );
}
