import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

const links = [
  { to: "/about", label: "~/about" },
  { to: "/experience", label: "~/experience" },
  { to: "/projects", label: "~/projects" },
  { to: "/contact", label: "~/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav-header">
      <div className="container nav-inner">
        <Link to="/" className="nav-logo" aria-label="Aryan Kaushik home">
          <span className="nav-logo-mark">AK</span>
          <span className="nav-logo-text">Aryan.Kaushik</span>
        </Link>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          {links.map((l) => (
            <NavLink key={l.label} to={l.to} className="nav-link" onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <a
            href="https://github.com/Aryankaushik541"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost"
            style={{ padding: "8px 14px" }}
          >
            GitHub ↗
          </a>
          <NavLink to="/login" className="nav-admin-link" onClick={() => setOpen(false)}>
            Admin
          </NavLink>
        </nav>

        <button
          className="nav-burger"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
}
