export default function RepoCard({ repo }) {
  return (
    <a href={repo.url} target="_blank" rel="noreferrer" className="card repo-card">
      <div className="repo-top">
        <h3 className="repo-name">{repo.name}</h3>
        <span className="repo-stars">★ {repo.stars ?? 0}</span>
      </div>
      <p className="repo-desc">{repo.description || "No description provided."}</p>
      <div className="repo-meta">
        {repo.language && <span className="tag">{repo.language}</span>}
        {(repo.topics || []).slice(0, 3).map((t) => (
          <span className="tag" key={t}>
            {t}
          </span>
        ))}
      </div>
    </a>
  );
}
