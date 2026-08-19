import { profile } from "../data/profile";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "36px 0" }}>
      <div className="container" style={styles.row}>
        <span style={styles.mono}>
          © {new Date().getFullYear()} {profile.name} · built with React + MERN
        </span>
        <div style={styles.links}>
          <a href={profile.links.github} target="_blank" rel="noreferrer" style={styles.mono}>
            GitHub
          </a>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer" style={styles.mono}>
            LinkedIn
          </a>
          <a href={`mailto:${profile.email}`} style={styles.mono}>
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  mono: {
    fontFamily: "var(--font-mono)",
    fontSize: 12.5,
    color: "var(--text-muted)",
  },
  links: {
    display: "flex",
    gap: 20,
  },
};
