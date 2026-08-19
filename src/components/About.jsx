import { skillGroups } from "../data/profile";
import useReveal from "../hooks/useReveal";
import SEO from "./SEO";
import "./About.css";

export default function About({ standalone = false }) {
  const revealRef = useReveal();

  return (
    <section id="about">
      {standalone && (
        <SEO
          title="About"
          description="About Aryan Kaushik — Full-Stack Developer & Certified Ethical Hacker (CEH). Skills across React.js, Node.js, Express.js, MongoDB, Python, and secure API design."
          path="/about"
        />
      )}
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">~/about</p>
            <h2>Stack & credentials</h2>
          </div>
          <span className="path-label">3+ years · React.js · Node.js · MongoDB</span>
        </div>

        <div className="skills-grid reveal" ref={revealRef}>
          {skillGroups.map((group) => (
            <div key={group.label} className="skill-card card">
              <div className="skill-label">{group.label}</div>
              <div className="skill-chips">
                {group.items.map((item) => (
                  <span key={item} className="tag">
                    {item}
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
