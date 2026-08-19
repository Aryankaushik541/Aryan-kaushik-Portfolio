import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function NotFound() {
  return (
    <section style={{ borderTop: "none", textAlign: "center", padding: "120px 0" }}>
      <SEO title="404" description="Page not found." path="/404" />
      <p className="eyebrow" style={{ justifyContent: "center" }}>
        404
      </p>
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>Route not found</h1>
      <p style={{ marginBottom: 28 }}>This path doesn't resolve to a page.</p>
      <Link to="/" className="btn btn-primary">
        Back home
      </Link>
    </section>
  );
}
