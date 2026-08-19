import SEO from "../components/SEO";
import Hero from "../components/Hero";
import About from "../components/About";
import Experience from "../components/Experience";
import FeaturedProjects from "../components/FeaturedProjects";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <>
      <SEO
        description="Aryan Kaushik — full-stack developer specializing in React.js, Node.js, and MongoDB (MERN), with a Certified Ethical Hacker (CEH) background in JWT auth, RBAC, and secure REST APIs."
        path="/"
      />
      <Hero />
      <About />
      <Experience />
      <FeaturedProjects />
      <Contact />
    </>
  );
}
