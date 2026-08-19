import { Link } from "react-router-dom";
import { featuredProjects } from "../data/profile";
import useReveal from "../hooks/useReveal";
import "./FeaturedProjects.css";

export default function FeaturedProjects() {
  const revealRef = useReveal();

  return (
    <section id="work">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">~/work</p>
            <h2>Featured builds</h2>
          </div>
          <Link to="/projects" className="path-label">
            All GitHub projects →
          </Link>
        </div>

        <div className="projects-grid reveal" ref={revealRef}>
          {featuredProjects.map((p) => (
            <div className="project-card card" key={p.name}>
              <h3 className="project-name">
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noreferrer">
                    {p.name} ↗
                  </a>
                ) : (
                  p.name
                )}
              </h3>
              <p className="project-desc">{p.description}</p>
              <div className="project-stack">
                {p.stack.map((s) => (
                  <span key={s} className="tag">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
