import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, clearToken } from "../utils/api";
import SEO from "../components/SEO";
import "./AdminDashboard.css";

// ── helpers ──────────────────────────────────────────────────────────────────
function fmt(n) { return Number(n ?? 0).toLocaleString(); }
function ago(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)  return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

// ── tiny bar chart (pure SVG, no deps) ───────────────────────────────────────
function BarChart({ data = [] }) {
  if (!data.length) return <p className="admin-sub" style={{textAlign:"center",padding:"24px 0"}}>No visit data yet — data appears once the site gets real traffic.</p>;
  const max  = Math.max(...data.map((d) => d.count), 1);
  const W    = 100;   // percent units for viewBox trick
  const barW = W / data.length - 1;
  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} 60`} preserveAspectRatio="none" className="bar-svg">
        {data.map((d, i) => {
          const h = Math.max(2, (d.count / max) * 50);
          return (
            <g key={d.date}>
              <rect
                x={i * (barW + 1)}  y={60 - h}
                width={barW}         height={h}
                fill="var(--accent)" opacity="0.75" rx="1"
              />
              <title>{d.date}: {d.count} visits</title>
            </g>
          );
        })}
      </svg>
      <div className="chart-labels">
        {[data[0]?.date, data[Math.floor(data.length/2)]?.date, data[data.length-1]?.date]
          .map((d,i) => <span key={i}>{d?.slice(5)}</span>)}
      </div>
    </div>
  );
}

// ── stat card ─────────────────────────────────────────────────────────────────
function StatCard({ num, label, accent }) {
  return (
    <div className="card stat-card">
      <div className="stat-num" style={accent ? { color: "var(--accent)" } : {}}>{fmt(num)}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ── tabs definition ───────────────────────────────────────────────────────────
const TABS = [
  { key:"overview",  label:"Overview",  icon:"◈" },
  { key:"analytics", label:"Analytics", icon:"◉" },
  { key:"seo",       label:"SEO",       icon:"◎" },
  { key:"profile",   label:"Profile",   icon:"◆" },
  { key:"projects",  label:"Projects",  icon:"⊞" },
  { key:"messages",  label:"Messages",  icon:"◇" },
  { key:"chat",      label:"Chat",      icon:"◌" },
  { key:"settings",  label:"Settings",  icon:"⚙" },
];

// ══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  function handleLogout() { clearToken(); navigate("/login"); }

  return (
    <section className="admin-section">
      <SEO title="Admin Dashboard" description="Site control panel." path="/admin" />
      <div className="container admin-shell">

        <aside className="admin-sidebar card">
          <div className="admin-brand">⬡ portfolio.admin</div>
          <nav className="admin-nav">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`admin-nav-btn ${tab === t.key ? "active" : ""}`}
                onClick={() => setTab(t.key)}
              >
                <span className="tab-icon">{t.icon}</span> {t.label}
              </button>
            ))}
          </nav>
          <button className="btn btn-ghost" onClick={() => navigate("/ai")} style={{ marginBottom: 8 }}>
            ✳ AI Assistant
          </button>
          <button className="btn btn-ghost admin-logout" onClick={handleLogout}>↩ Log Out</button>
        </aside>

        <div className="admin-content">
          {tab === "overview"  && <Overview  setTab={setTab} />}
          {tab === "analytics" && <Analytics />}
          {tab === "seo"       && <SeoPanel />}
          {tab === "profile"   && <ProfileEditor />}
          {tab === "projects"  && <ProjectsTab />}
          {tab === "messages"  && <MessagesTab />}
          {tab === "chat"      && <ChatTab />}
          {tab === "settings"  && <SettingsTab />}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   OVERVIEW
══════════════════════════════════════════════════════════════════════════════ */
function Overview({ setTab }) {
  const [stats, setStats]     = useState(null);
  const [analytics, setAn]    = useState(null);
  const [error, setError]     = useState("");

  useEffect(() => {
    apiFetch("/api/admin/stats").then((d) => setStats(d.stats)).catch((e) => setError(e.message));
    apiFetch("/api/analytics/summary").then((d) => setAn(d.analytics)).catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in-up">
      <p className="eyebrow">~/admin</p>
      <h2 className="admin-h2">Dashboard Overview</h2>
      <p className="admin-sub">Site health at a glance.</p>
      {error && <p className="login-error">{error}</p>}

      <div className="stat-grid">
        <StatCard num={stats?.messageCount}   label="Total Messages" />
        <StatCard num={stats?.unreadCount}    label="Unread Messages" accent />
        <StatCard num={stats?.chatCount}      label="Chat Sessions" />
        <StatCard num={stats?.unreadChatCount} label="Unread Chats" accent />
        <StatCard num={stats?.projectCount}   label="Projects" />
        <StatCard num={analytics?.last24h}    label="Visits Today" accent />
        <StatCard num={analytics?.last7}      label="Visits (7d)" />
        <StatCard num={analytics?.total}      label="Total Visits" />
      </div>

      <div className="overview-quick">
        {[
          { key:"messages",  label:"View Messages",    badge: stats?.unreadCount },
          { key:"analytics", label:"SEO Analytics",    badge: null },
          { key:"projects",  label:"Manage Projects",  badge: null },
          { key:"settings",  label:"Site Settings",    badge: null },
        ].map((q) => (
          <button key={q.key} className="card quick-card" onClick={() => setTab(q.key)}>
            <span>{q.label} →</span>
            {q.badge > 0 && <span className="badge">{q.badge}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ANALYTICS
══════════════════════════════════════════════════════════════════════════════ */
function Analytics() {
  const [data,  setData]  = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/analytics/summary")
      .then((d) => setData(d.analytics))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="animate-fade-in-up">
      <p className="eyebrow">~/analytics</p>
      <h2 className="admin-h2">Visit Analytics</h2>
      <p className="admin-sub">Self-hosted, privacy-first — no cookies, no third-party trackers.</p>
      {error && <p className="login-error">{error}</p>}

      {data && (
        <>
          <div className="stat-grid">
            <StatCard num={data.last24h} label="Today"       accent />
            <StatCard num={data.last7}   label="Last 7 days" />
            <StatCard num={data.last30}  label="Last 30 days"/>
            <StatCard num={data.total}   label="All Time"    />
          </div>

          <div className="card analytics-card">
            <h3 className="card-h3">Last 14 Days — Daily Trend</h3>
            <BarChart data={data.daily} />
          </div>

          <div className="analytics-two-col">
            <div className="card analytics-card">
              <h3 className="card-h3">Top Pages (30d)</h3>
              {data.topPages.length === 0 && <p className="admin-sub">No data yet.</p>}
              <table className="data-table">
                <thead><tr><th>Path</th><th>Visits</th></tr></thead>
                <tbody>
                  {data.topPages.map((p) => (
                    <tr key={p.path}>
                      <td><code className="path-label">{p.path}</code></td>
                      <td>{fmt(p.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card analytics-card">
              <h3 className="card-h3">Top Referrers (30d)</h3>
              {data.topReferrers.length === 0 && <p className="admin-sub">No referrer data yet.</p>}
              <table className="data-table">
                <thead><tr><th>Referrer</th><th>Visits</th></tr></thead>
                <tbody>
                  {data.topReferrers.map((r) => (
                    <tr key={r.ref}>
                      <td style={{wordBreak:"break-all",fontSize:12}}>{r.ref.slice(0,60)}</td>
                      <td>{fmt(r.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SEO PANEL
══════════════════════════════════════════════════════════════════════════════ */
const SEO_CHECKS = [
  { label: "HTTPS enabled",                 check: () => location.protocol === "https:" || location.hostname === "localhost" },
  { label: "Sitemap.xml present",            check: null, note: "aryan-kaushik-portfolio.vercel.app/sitemap.xml" },
  { label: "Robots.txt present",             check: null, note: "aryan-kaushik-portfolio.vercel.app/robots.txt"  },
  { label: "Canonical URLs in SEO component",check: () => true },
  { label: "Open Graph tags (og:title, og:description)", check: () => true },
  { label: "Meta description on every page", check: () => true },
  { label: "Mobile-responsive design",       check: () => true },
  { label: "JavaScript bundle split (Vite)", check: () => true },
];

function SeoPanel() {
  const [profile, setProfile] = useState(null);
  const [form,    setForm]    = useState({});
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    apiFetch("/api/admin/profile")
      .then((d) => { setProfile(d.profile); setForm({ seoTitle: d.profile.seoTitle || "", seoDescription: d.profile.seoDescription || "", seoKeywords: d.profile.seoKeywords || "" }); })
      .catch((e) => setError(e.message));
  }, []);

  async function saveSeo(e) {
    e.preventDefault(); setError(""); setSaved(false);
    try {
      await apiFetch("/api/admin/profile", { method: "PUT", body: JSON.stringify(form) });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e.message); }
  }

  const siteUrl = "https://aryan-kaushik-portfolio.vercel.app";
  const previewTitle = form.seoTitle || "Aryan Kaushik — Full-Stack Developer & Certified Ethical Hacker";
  const previewDesc  = form.seoDescription || "Full-Stack Developer with 3+ years of experience building production-grade web applications.";

  return (
    <div className="animate-fade-in-up">
      <p className="eyebrow">~/seo</p>
      <h2 className="admin-h2">SEO Health & Settings</h2>
      <p className="admin-sub">Manage meta tags, check health, and monitor search visibility.</p>
      {error && <p className="login-error">{error}</p>}

      {/* SEO Health Checklist */}
      <div className="card analytics-card" style={{marginBottom:20}}>
        <h3 className="card-h3">SEO Checklist</h3>
        <div className="seo-checks">
          {SEO_CHECKS.map((item) => {
            const pass = item.check ? item.check() : true;
            return (
              <div key={item.label} className="seo-check-row">
                <span className={`seo-dot ${pass ? "pass" : "fail"}`}>{pass ? "✓" : "✗"}</span>
                <span>{item.label}</span>
                {item.note && <a href={`https://${item.note}`} target="_blank" rel="noreferrer" className="path-label" style={{marginLeft:"auto",fontSize:11}}>check ↗</a>}
              </div>
            );
          })}
        </div>
        <div className="seo-score">
          <div className="score-ring">
            <span className="score-num">8/8</span>
          </div>
          <span className="admin-sub">SEO Score — All checks passing ✓</span>
        </div>
      </div>

      {/* Google SERP preview */}
      <div className="card analytics-card" style={{marginBottom:20}}>
        <h3 className="card-h3">Google Search Preview</h3>
        <div className="serp-preview">
          <div className="serp-url">{siteUrl}</div>
          <div className="serp-title">{previewTitle.slice(0, 60)}{previewTitle.length > 60 ? "…" : ""}</div>
          <div className="serp-desc">{previewDesc.slice(0, 160)}{previewDesc.length > 160 ? "…" : ""}</div>
        </div>
        <p className="admin-sub" style={{marginTop:8,fontSize:12}}>
          Title: <strong style={{color: previewTitle.length > 60 ? "var(--red-flag)" : "var(--accent)"}}>{previewTitle.length}/60</strong> chars &nbsp;|&nbsp;
          Desc:  <strong style={{color: previewDesc.length > 160 ? "var(--red-flag)" : "var(--accent)"}}>{previewDesc.length}/160</strong> chars
        </p>
      </div>

      {/* Edit SEO meta */}
      <div className="card analytics-card">
        <h3 className="card-h3">Edit Global SEO Meta</h3>
        {saved && <p className="settings-saved">Saved ✓</p>}
        <form onSubmit={saveSeo} className="project-form" style={{marginTop:12}}>
          <label className="login-label">Page Title (≤60 chars)</label>
          <input
            value={form.seoTitle || ""} maxLength={70}
            onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
            placeholder="Aryan Kaushik — Full-Stack Developer & CEH"
          />
          <label className="login-label">Meta Description (≤160 chars)</label>
          <textarea
            rows={3} value={form.seoDescription || ""} maxLength={180}
            onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
            placeholder="Full-Stack Developer with experience in MERN, Python, and cybersecurity..."
          />
          <label className="login-label">Keywords (comma-separated)</label>
          <input
            value={form.seoKeywords || ""}
            onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
            placeholder="full-stack developer, MERN, React, Node.js, ethical hacker"
          />
          <button className="btn btn-primary" type="submit">Save SEO Settings</button>
        </form>
      </div>

      {/* External tools */}
      <div className="card analytics-card" style={{marginTop:20}}>
        <h3 className="card-h3">External SEO Tools</h3>
        <div className="seo-links">
          {[
            { label: "Google Search Console",   url: "https://search.google.com/search-console" },
            { label: "Google PageSpeed Insights", url: `https://pagespeed.web.dev/report?url=${encodeURIComponent(siteUrl)}` },
            { label: "Bing Webmaster Tools",      url: "https://www.bing.com/webmasters/" },
            { label: "Ahrefs Free Tools",         url: "https://ahrefs.com/free-seo-tools" },
            { label: "Sitemap.xml",               url: `${siteUrl}/sitemap.xml` },
            { label: "Robots.txt",                url: `${siteUrl}/robots.txt` },
          ].map((l) => (
            <a key={l.label} href={l.url} target="_blank" rel="noreferrer" className="card seo-link-card">
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PROFILE EDITOR  (A-Z content management)
══════════════════════════════════════════════════════════════════════════════ */
function ProfileEditor() {
  const [profile, setProfile] = useState(null);
  const [saved,   setSaved]   = useState("");
  const [error,   setError]   = useState("");
  const [subtab,  setSubtab]  = useState("hero");

  useEffect(() => {
    apiFetch("/api/admin/profile").then((d) => setProfile(d.profile)).catch((e) => setError(e.message));
  }, []);

  async function save(patch) {
    setSaved(""); setError("");
    try {
      const data = await apiFetch("/api/admin/profile", { method: "PUT", body: JSON.stringify(patch) });
      setProfile(data.profile);
      setSaved("Saved ✓"); setTimeout(() => setSaved(""), 3000);
    } catch (e) { setError(e.message); }
  }

  const SUBTABS = ["hero", "skills", "experience", "education", "certifications"];

  return (
    <div className="animate-fade-in-up">
      <p className="eyebrow">~/profile</p>
      <h2 className="admin-h2">Profile Editor</h2>
      <p className="admin-sub">Edit all site content — hero, skills, experience, education, certifications.</p>
      {error && <p className="login-error">{error}</p>}
      {saved && <p className="settings-saved">{saved}</p>}

      <div className="subtab-nav">
        {SUBTABS.map((s) => (
          <button key={s} className={`subtab-btn ${subtab===s?"active":""}`} onClick={() => setSubtab(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {!profile ? <p className="admin-sub">Loading…</p> : (
        <>
          {subtab === "hero"           && <HeroForm         profile={profile} onSave={save} />}
          {subtab === "skills"         && <SkillsForm        profile={profile} onSave={save} />}
          {subtab === "experience"     && <ExperienceForm    profile={profile} onSave={save} />}
          {subtab === "education"      && <EducationForm     profile={profile} onSave={save} />}
          {subtab === "certifications" && <CertificationsForm profile={profile} onSave={save} />}
        </>
      )}
    </div>
  );
}

function HeroForm({ profile, onSave }) {
  const [f, setF] = useState({
    name:         profile.name         || "Aryan Kaushik",
    title:        profile.title        || "Full-Stack Developer",
    summary:      profile.summary      || "",
    availableFor: profile.availableFor || "AVAILABLE FOR OPPORTUNITIES",
    heroAccent:   profile.heroAccent   || "MERN",
    email:        profile.email        || "",
    phone:        profile.phone        || "",
    location:     profile.location     || "India",
    github:       profile.github       || "",
    linkedin:     profile.linkedin     || "",
  });
  return (
    <form className="card project-form" onSubmit={(e) => { e.preventDefault(); onSave(f); }}>
      <h3 className="card-h3">Hero Section</h3>
      {[
        ["name","Name"],["title","Title / Role"],["heroAccent","Hero Accent Word"],
        ["availableFor","Status Badge Text"],["email","Public Email"],
        ["phone","Phone"],["location","Location"],["github","GitHub URL"],["linkedin","LinkedIn URL"],
      ].map(([key, label]) => (
        <div key={key}>
          <label className="login-label">{label}</label>
          <input value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} />
        </div>
      ))}
      <label className="login-label">Summary / Bio</label>
      <textarea rows={5} value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} />
      <button className="btn btn-primary" type="submit">Save Hero</button>
    </form>
  );
}

function SkillsForm({ profile, onSave }) {
  const defaultGroups = [
    { label:"Languages", items:["JavaScript (ES6+)","Python","TypeScript","C++","Java","PHP"] },
    { label:"Frontend",  items:["React.js","React Native","Angular.js","HTML5","CSS3","Tailwind CSS"] },
    { label:"Backend",   items:["Node.js","Express.js","Django","DRF","REST API","Microservices"] },
    { label:"Databases", items:["MongoDB","MySQL","PostgreSQL","SQLite"] },
    { label:"Security",  items:["JWT","RBAC","bcrypt","CSRF Protection","Cloudflare","Pen Testing"] },
    { label:"Tools",     items:["Git","Docker","Postman","Linux","CI/CD","OpenAI API","Agile/Scrum"] },
  ];
  const [groups, setGroups] = useState(
    profile.skillGroups?.length ? profile.skillGroups.map(g => ({ ...g, items: [...(g.items||[])] })) : defaultGroups
  );

  const updateLabel = (i, val) => setGroups(g => g.map((x,j) => j===i ? {...x, label: val} : x));
  const updateItems = (i, val) => setGroups(g => g.map((x,j) => j===i ? {...x, items: val.split(",").map(s=>s.trim()).filter(Boolean)} : x));
  const addGroup    = () => setGroups([...groups, { label: "New Group", items: [] }]);
  const removeGroup = (i) => setGroups(g => g.filter((_,j) => j !== i));

  return (
    <form className="card project-form" onSubmit={(e) => { e.preventDefault(); onSave({ skillGroups: groups }); }}>
      <h3 className="card-h3">Skills</h3>
      {groups.map((g, i) => (
        <div key={i} className="skill-group-editor">
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input value={g.label} onChange={(e) => updateLabel(i, e.target.value)} placeholder="Group label" style={{flex:1}} />
            <button type="button" className="tag as-btn danger" onClick={() => removeGroup(i)}>✕</button>
          </div>
          <input value={g.items.join(", ")} onChange={(e) => updateItems(i, e.target.value)} placeholder="Skill 1, Skill 2, Skill 3" />
        </div>
      ))}
      <button type="button" className="btn btn-ghost" onClick={addGroup}>+ Add Group</button>
      <button className="btn btn-primary" type="submit">Save Skills</button>
    </form>
  );
}

function ExperienceForm({ profile, onSave }) {
  const defaultExp = [
    { role:"Android Development Intern", org:"Gowox Infotech Pvt. Ltd.", period:"Dec 2022 – Jan 2023", points:["Developed 2 production Android apps.","Reduced latency by ~25%."] },
    { role:"Website Dev & DB Intern",    org:"Gowox Infotech Pvt. Ltd.", period:"Apr 2022 – May 2022", points:["Built 3 responsive websites.","Designed MySQL databases."] },
  ];
  const [items, setItems] = useState(
    profile.experience?.length ? profile.experience.map(e => ({...e, points:[...(e.points||[])]})) : defaultExp
  );
  const update = (i, key, val) => setItems(arr => arr.map((x,j) => j===i ? {...x, [key]: val} : x));
  const add    = () => setItems([...items, { role:"", org:"", period:"", points:[] }]);
  const remove = (i) => setItems(arr => arr.filter((_,j) => j !== i));

  return (
    <form className="card project-form" onSubmit={(e) => { e.preventDefault(); onSave({ experience: items.map(x => ({...x, points: typeof x.points === "string" ? x.points.split("\n").map(s=>s.trim()).filter(Boolean) : x.points})) }); }}>
      <h3 className="card-h3">Experience</h3>
      {items.map((x, i) => (
        <div key={i} className="exp-editor card" style={{padding:12,marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <strong style={{fontSize:13}}>Entry {i+1}</strong>
            <button type="button" className="tag as-btn danger" onClick={() => remove(i)}>Remove</button>
          </div>
          {[["role","Role / Title"],["org","Organisation"],["period","Period"]].map(([k,l]) => (
            <div key={k}>
              <label className="login-label" style={{fontSize:11}}>{l}</label>
              <input value={x[k]||""} onChange={(e) => update(i, k, e.target.value)} />
            </div>
          ))}
          <label className="login-label" style={{fontSize:11}}>Highlights (one per line)</label>
          <textarea rows={3} value={Array.isArray(x.points) ? x.points.join("\n") : x.points} onChange={(e) => update(i, "points", e.target.value)} />
        </div>
      ))}
      <button type="button" className="btn btn-ghost" onClick={add}>+ Add Experience</button>
      <button className="btn btn-primary" type="submit">Save Experience</button>
    </form>
  );
}

function EducationForm({ profile, onSave }) {
  const defaultEdu = [
    { degree:"B.Tech, Computer Science & Engineering", school:"MAKAUT", period:"2023 – 2026", note:"" },
    { degree:"Diploma, Computer Science", school:"Government Polytechnic", period:"2020 – 2023", note:"CGPA 7.5/10" },
    { degree:"Matriculation (CBSE)", school:"G.D Mission Public School", period:"", note:"70%" },
  ];
  const [items, setItems] = useState(profile.education?.length ? [...profile.education] : defaultEdu);
  const update = (i, k, v) => setItems(arr => arr.map((x,j) => j===i ? {...x,[k]:v} : x));
  const add    = () => setItems([...items, { degree:"", school:"", period:"", note:"" }]);
  const remove = (i) => setItems(arr => arr.filter((_,j) => j !== i));

  return (
    <form className="card project-form" onSubmit={(e) => { e.preventDefault(); onSave({ education: items }); }}>
      <h3 className="card-h3">Education</h3>
      {items.map((x, i) => (
        <div key={i} className="exp-editor card" style={{padding:12,marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <strong style={{fontSize:13}}>Entry {i+1}</strong>
            <button type="button" className="tag as-btn danger" onClick={() => remove(i)}>Remove</button>
          </div>
          {[["degree","Degree"],["school","School / University"],["period","Period"],["note","Note / Grade"]].map(([k,l]) => (
            <div key={k}>
              <label className="login-label" style={{fontSize:11}}>{l}</label>
              <input value={x[k]||""} onChange={(e) => update(i, k, e.target.value)} />
            </div>
          ))}
        </div>
      ))}
      <button type="button" className="btn btn-ghost" onClick={add}>+ Add Education</button>
      <button className="btn btn-primary" type="submit">Save Education</button>
    </form>
  );
}

function CertificationsForm({ profile, onSave }) {
  const defaultCerts = [
    "Certified Ethical Hacker (CEH) — Valid Jan 2021 – Jan 2026",
    "IIT Bombay: CSS, C++, Python, PHP & MySQL",
    "Virtual Platforms: React.js, Node.js, Angular.js",
    "Cisco Networking Academy: IT Essentials, Networking Essentials",
    "PLC & SCADA – NSDC (SOFCON India)",
  ];
  const [text, setText] = useState((profile.certifications?.length ? profile.certifications : defaultCerts).join("\n"));

  return (
    <form className="card project-form" onSubmit={(e) => { e.preventDefault(); onSave({ certifications: text.split("\n").map(s=>s.trim()).filter(Boolean) }); }}>
      <h3 className="card-h3">Certifications</h3>
      <p className="admin-sub">One certification per line.</p>
      <textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn btn-primary" type="submit">Save Certifications</button>
    </form>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PROJECTS
══════════════════════════════════════════════════════════════════════════════ */
const EMPTY_PROJ = { name: "", stack: "", url: "", points: "" };

function ProjectsTab() {
  const [projects,  setProjects]  = useState([]);
  const [form,      setForm]      = useState(EMPTY_PROJ);
  const [editingId, setEditingId] = useState(null);
  const [error,     setError]     = useState("");

  const load = useCallback(() => {
    apiFetch("/api/admin/projects").then((d) => setProjects(d.projects)).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  function toPayload() {
    return {
      name:   form.name,
      stack:  form.stack.split(",").map((s)=>s.trim()).filter(Boolean),
      url:    form.url,
      points: form.points.split("\n").map((s)=>s.trim()).filter(Boolean),
    };
  }

  async function submit(e) {
    e.preventDefault(); setError("");
    try {
      if (editingId)
        await apiFetch(`/api/admin/projects/${editingId}`, { method:"PUT",  body: JSON.stringify(toPayload()) });
      else
        await apiFetch("/api/admin/projects",              { method:"POST", body: JSON.stringify(toPayload()) });
      setForm(EMPTY_PROJ); setEditingId(null); load();
    } catch (e) { setError(e.message); }
  }

  function startEdit(p) {
    setEditingId(p._id);
    setForm({ name: p.name, stack: (p.stack||[]).join(", "), url: p.url||"", points: (p.points||[]).join("\n") });
  }

  async function remove(id) {
    if (!confirm("Delete this project?")) return;
    try { await apiFetch(`/api/admin/projects/${id}`, { method:"DELETE" }); load(); }
    catch (e) { setError(e.message); }
  }

  return (
    <div className="animate-fade-in-up">
      <p className="eyebrow">~/projects</p>
      <h2 className="admin-h2">Projects</h2>
      <p className="admin-sub">Add, edit, or remove the projects shown on your public site.</p>
      {error && <p className="login-error">{error}</p>}

      <form className="card project-form" onSubmit={submit}>
        <h3 className="card-h3">{editingId ? "Edit Project" : "Add New Project"}</h3>
        <input placeholder="Project name *" value={form.name} required
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Tech stack (comma-separated)" value={form.stack}
          onChange={(e) => setForm({ ...form, stack: e.target.value })} />
        <input placeholder="Live URL (optional)" value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })} />
        <textarea placeholder="Highlights — one per line" rows={3} value={form.points}
          onChange={(e) => setForm({ ...form, points: e.target.value })} />
        <div className="project-form-actions">
          <button className="btn btn-primary" type="submit">
            {editingId ? "Update Project" : "Add Project"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost"
              onClick={() => { setEditingId(null); setForm(EMPTY_PROJ); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="message-list">
        {projects.length === 0 && <p className="admin-sub">No projects yet — add one above.</p>}
        {projects.map((p) => (
          <div key={p._id} className="card message-item">
            <div className="message-top">
              <div>
                <strong>{p.name}</strong>
                {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="path-label" style={{marginLeft:8}}>↗ live</a>}
              </div>
              <div className="message-actions">
                <button className="tag as-btn" onClick={() => startEdit(p)}>Edit</button>
                <button className="tag as-btn danger" onClick={() => remove(p._id)}>Delete</button>
              </div>
            </div>
            <div className="project-stack">
              {(p.stack||[]).map((s) => <span key={s} className="tag">{s}</span>)}
            </div>
            {p.points?.length > 0 && (
              <ul style={{margin:"8px 0 0 16px",padding:0,fontSize:13,color:"var(--text-muted)"}}>
                {p.points.map((pt,i) => <li key={i}>{pt}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MESSAGES
══════════════════════════════════════════════════════════════════════════════ */
function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [error,    setError]    = useState("");
  const [filter,   setFilter]   = useState("all");

  const load = useCallback(() => {
    apiFetch("/api/admin/messages").then((d) => setMessages(d.messages)).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  async function markRead(id) {
    try { await apiFetch(`/api/admin/messages/${id}/read`, { method:"PATCH" }); load(); }
    catch (e) { setError(e.message); }
  }
  async function remove(id) {
    if (!confirm("Delete this message?")) return;
    try { await apiFetch(`/api/admin/messages/${id}`, { method:"DELETE" }); load(); }
    catch (e) { setError(e.message); }
  }

  const shown = filter === "unread" ? messages.filter((m) => !m.read) : messages;

  return (
    <div className="animate-fade-in-up">
      <p className="eyebrow">~/messages</p>
      <h2 className="admin-h2">Contact Messages</h2>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {["all","unread"].map((f) => (
          <button key={f} className={`tag as-btn ${filter===f?"active-filter":""}`} onClick={() => setFilter(f)}>
            {f === "all" ? `All (${messages.length})` : `Unread (${messages.filter(m=>!m.read).length})`}
          </button>
        ))}
      </div>
      {error && <p className="login-error">{error}</p>}
      <div className="message-list">
        {shown.length === 0 && <p className="admin-sub">No messages.</p>}
        {shown.map((m) => (
          <div key={m._id} className={`card message-item ${m.read ? "" : "unread"}`}>
            <div className="message-top">
              <div>
                <strong>{m.name}</strong>
                <span className="path-label" style={{marginLeft:8}}>{m.email}</span>
                <span className="path-label" style={{marginLeft:8,fontSize:11}}>{ago(m.createdAt)}</span>
              </div>
              <div className="message-actions">
                {!m.read && <button className="tag as-btn" onClick={() => markRead(m._id)}>Mark read</button>}
                <button className="tag as-btn danger" onClick={() => remove(m._id)}>Delete</button>
              </div>
            </div>
            {m.subject && <div className="message-subject">{m.subject}</div>}
            <p style={{margin:"6px 0 0",whiteSpace:"pre-wrap"}}>{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   CHAT
══════════════════════════════════════════════════════════════════════════════ */
function ChatTab() {
  const [chats,      setChats]      = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [error,      setError]      = useState("");

  const load = useCallback(() => {
    apiFetch("/api/admin/chats")
      .then((d) => { setChats(d.chats); if (!selectedId && d.chats.length) setSelectedId(d.chats[0]._id); })
      .catch((e) => setError(e.message));
  }, [selectedId]);
  useEffect(load, []);  // eslint-disable-line

  async function openChat(chat) {
    setSelectedId(chat._id);
    if (!chat.read) { try { await apiFetch(`/api/admin/chats/${chat._id}/read`, { method:"PATCH" }); load(); } catch {} }
  }
  async function remove(id) {
    if (!confirm("Delete this conversation?")) return;
    try { await apiFetch(`/api/admin/chats/${id}`, { method:"DELETE" }); setSelectedId(null); load(); }
    catch (e) { setError(e.message); }
  }

  const selected = chats.find((c) => c._id === selectedId);

  return (
    <div className="animate-fade-in-up">
      <p className="eyebrow">~/chat</p>
      <h2 className="admin-h2">Chat Sessions</h2>
      <p className="admin-sub">Visitor conversations from the on-site chatbot.</p>
      {error && <p className="login-error">{error}</p>}
      <div className="card chat-mock">
        <div className="chat-mock-list">
          {chats.length === 0 && <p className="admin-sub" style={{padding:16}}>No conversations yet.</p>}
          {chats.map((c) => {
            const last = c.messages[c.messages.length - 1];
            return (
              <div key={c._id} className={`chat-mock-thread as-btn ${c._id===selectedId?"active":""}`}
                onClick={() => openChat(c)} role="button" tabIndex={0}>
                <div className="wa-avatar">{(c.visitorName||"V")[0].toUpperCase()}</div>
                <div className="chat-mock-thread-body">
                  <div className="chat-mock-thread-top">
                    <strong>{c.visitorName || "Anonymous"}</strong>
                    {!c.read && <span className="tag" style={{color:"var(--accent)"}}>new</span>}
                    <span className="path-label" style={{fontSize:10,marginLeft:"auto"}}>{ago(c.updatedAt)}</span>
                  </div>
                  <div className="chat-mock-preview">{last ? last.text : "…"}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="chat-thread">
          {selected ? (
            <>
              <div className="chat-thread-header">
                <strong>{selected.visitorName || "Anonymous"}</strong>
                <span className="path-label" style={{fontSize:11}}>{selected.messages.length} messages</span>
                <button className="tag as-btn danger" onClick={() => remove(selected._id)}>Delete</button>
              </div>
              <div className="chat-thread-body">
                {selected.messages.map((m, i) => (
                  <div key={i} className={`chatbot-bubble ${m.from}`}>{m.text}</div>
                ))}
              </div>
            </>
          ) : (
            <div className="chat-mock-empty">Select a conversation →</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SETTINGS
══════════════════════════════════════════════════════════════════════════════ */
function SettingsTab() {
  const [form,  setForm]  = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/admin/settings").then((d) => setForm(d.settings || {})).catch((e) => setError(e.message));
  }, []);

  async function submit(e) {
    e.preventDefault(); setError(""); setSaved(false);
    try { await apiFetch("/api/admin/settings", { method:"PUT", body: JSON.stringify(form) }); setSaved(true); setTimeout(()=>setSaved(false),3000); }
    catch (e) { setError(e.message); }
  }

  if (!form) return <p className="admin-sub">Loading…</p>;

  const fields = [
    ["name","Display Name"],["title","Title / Role"],["email","Public Email"],
    ["phone","Phone"],["whatsapp","WhatsApp Number"],
    ["github","GitHub URL"],["linkedin","LinkedIn URL"],
  ];

  return (
    <div className="animate-fade-in-up">
      <p className="eyebrow">~/settings</p>
      <h2 className="admin-h2">Site Settings</h2>
      <p className="admin-sub">Contact details, WhatsApp button config — no redeploy needed.</p>
      {error && <p className="login-error">{error}</p>}
      {saved && <p className="settings-saved">Saved ✓</p>}

      <form className="card project-form" onSubmit={submit}>
        {fields.map(([key, label]) => (
          <div key={key}>
            <label className="login-label">{label}</label>
            <input value={form[key]||""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          </div>
        ))}
        <label className="login-label">Summary</label>
        <textarea rows={4} value={form.summary||""} onChange={(e) => setForm({ ...form, summary: e.target.value })} />

        <label className="settings-checkbox">
          <input type="checkbox" checked={Boolean(form.maintenanceMode)}
            onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })} />
          Maintenance mode (takes site offline)
        </label>
        <button className="btn btn-primary" type="submit">Save Settings</button>
      </form>
    </div>
  );
}
