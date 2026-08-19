import "./ClearanceBadge.css";

export default function ClearanceBadge() {
  return (
    <div className="badge card" role="img" aria-label="Certified Ethical Hacker credential, valid January 2021 to January 2026">
      <div className="badge-scan" aria-hidden="true" />
      <div className="badge-row">
        <span className="badge-dot" />
        <span className="badge-label">CLEARANCE</span>
      </div>
      <div className="badge-title">Certified Ethical Hacker</div>
      <div className="badge-sub">CEH · valid 2021 – 2026</div>
      <div className="badge-meta">
        <span>JWT</span>
        <span>·</span>
        <span>RBAC</span>
        <span>·</span>
        <span>Pen Testing</span>
      </div>
    </div>
  );
}
