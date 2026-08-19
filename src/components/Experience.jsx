import { experience, education, certifications } from "../data/profile";
import useReveal from "../hooks/useReveal";
import SEO from "./SEO";
import "./Experience.css";

export default function Experience({ standalone = false }) {
  const revealRef = useReveal();

  return (
    <section id="experience">
      {standalone && (
        <SEO
          title="Experience"
          description="Aryan Kaushik's work experience, internships, education, and certifications — including CEH — in full-stack and MERN development."
          path="/experience"
        />
      )}
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">~/experience</p>
            <h2>Work & training</h2>
          </div>
        </div>

        <div className="timeline reveal" ref={revealRef}>
          {experience.map((job) => (
            <div className="timeline-item" key={job.role}>
              <div className="timeline-period path-label">{job.period}</div>
              <div className="timeline-body card">
                <h3 className="timeline-role">{job.role}</h3>
                <div className="timeline-org">{job.org}</div>
                <ul>
                  {job.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="edu-grid">
          <div className="card edu-card">
            <div className="skill-label">Education</div>
            {education.map((e) => (
              <div key={e.degree} className="edu-row">
                <div className="edu-degree">{e.degree}</div>
                <div className="edu-school path-label">
                  {e.school}
                  {e.period ? ` · ${e.period}` : ""}
                  {e.note ? ` · ${e.note}` : ""}
                </div>
              </div>
            ))}
          </div>
          <div className="card edu-card">
            <div className="skill-label">Certifications</div>
            <ul className="cert-list">
              {certifications.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
