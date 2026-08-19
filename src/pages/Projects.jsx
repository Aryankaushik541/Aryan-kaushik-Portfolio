import { useEffect, useMemo, useState } from "react";
import SEO from "../components/SEO";
import RepoCard from "../components/RepoCard";
import "./Projects.css";

const GITHUB_USERNAME = "Aryankaushik541";

export default function Projects() {
  const [repos, setRepos] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Try our own backend first (cached + no rate-limit worries)
      try {
        const res = await fetch("/api/github/repos");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.ok) {
            setRepos(data.repos);
            setStatus("ready");
            return;
          }
        }
        throw new Error("backend unavailable");
      } catch {
        // Fall back to calling GitHub directly (e.g. static hosting with no backend running)
        try {
          const res = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`
          );
          const raw = await res.json();
          if (!cancelled && Array.isArray(raw)) {
            const mapped = raw
              .filter((r) => !r.fork)
              .map((r) => ({
                name: r.name,
                description: r.description,
                url: r.html_url,
                language: r.language,
                stars: r.stargazers_count,
                topics: r.topics || [],
                updatedAt: r.updated_at,
              }));
            setRepos(mapped);
            setStatus("ready");
          } else if (!cancelled) {
            setStatus("error");
          }
        } catch {
          if (!cancelled) setStatus("error");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const languages = useMemo(() => {
    const set = new Set(repos.map((r) => r.language).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [repos]);

  const filtered = useMemo(() => {
    return repos.filter((r) => {
      const matchesQuery =
        !query ||
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(query.toLowerCase());
      const matchesLang = language === "all" || r.language === language;
      return matchesQuery && matchesLang;
    });
  }, [repos, query, language]);

  return (
    <>
      <SEO
        title="Projects"
        description="Live GitHub project feed for Aryan Kaushik — 29+ public repositories across React, Node.js, Python, and security tooling."
        path="/projects"
      />
      <section id="all-projects" style={{ borderTop: "none", paddingTop: 56 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">~/projects</p>
              <h2>All GitHub repositories</h2>
            </div>
            <a
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
              rel="noreferrer"
              className="path-label"
            >
              @{GITHUB_USERNAME} on GitHub →
            </a>
          </div>

          <div className="projects-toolbar">
            <input
              type="search"
              placeholder="Search repositories…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="projects-search"
              aria-label="Search repositories"
            />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="projects-filter"
              aria-label="Filter by language"
            >
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l === "all" ? "All languages" : l}
                </option>
              ))}
            </select>
          </div>

          {status === "loading" && <p className="path-label">Fetching latest repositories from GitHub…</p>}

          {status === "error" && (
            <p className="path-label">
              Couldn't reach GitHub right now. View the profile directly:{" "}
              <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">
                github.com/{GITHUB_USERNAME}
              </a>
            </p>
          )}

          {status === "ready" && (
            <>
              <p className="path-label" style={{ marginBottom: 20 }}>
                {filtered.length} repositor{filtered.length === 1 ? "y" : "ies"}
              </p>
              <div className="repo-grid">
                {filtered.map((r) => (
                  <RepoCard repo={r} key={r.name} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
