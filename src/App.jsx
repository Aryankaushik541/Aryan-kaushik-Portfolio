import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar          from "./components/Navbar";
import Footer          from "./components/Footer";
import Home            from "./pages/Home";
import Projects        from "./pages/Projects";
import NotFound        from "./pages/NotFound";
import About           from "./components/About";
import Experience      from "./components/Experience";
import Contact         from "./components/Contact";
import FeaturedProjects from "./components/FeaturedProjects";
import Hero            from "./components/Hero";
import RepoCard        from "./components/RepoCard";
import WhatsAppButton  from "./components/WhatsAppButton";
import ChatbotWidget   from "./components/ChatbotWidget";
import Login           from "./pages/Login";
import AdminDashboard  from "./pages/AdminDashboard";
import AIChat          from "./pages/AIChat";
import ProtectedRoute  from "./components/ProtectedRoute";

const API_BASE = import.meta.env.VITE_API_URL || "";

// Lightweight page-visit tracker (fire-and-forget, no cookies)
function Analytics() {
  const location = useLocation();
  useEffect(() => {
    fetch(`${API_BASE}/api/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location.pathname, referrer: document.referrer || "" }),
    }).catch(() => {});
  }, [location.pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  // The AI assistant page is a full-screen app shell of its own (like
  // Claude's UI), so the regular site chrome stays hidden on it.
  const isFullScreenPage = location.pathname === "/ai";

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Analytics />
      {!isFullScreenPage && <Navbar />}
      <main id="main">
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/projects"  element={<Projects />} />
          <Route path="/about"     element={<About standalone />} />
          <Route path="/experience" element={<Experience standalone />} />
          <Route path="/contact"   element={<Contact standalone />} />
          <Route path="/featured"  element={<FeaturedProjects />} />
          <Route path="/hero"      element={<Hero />} />
          <Route path="/repo"      element={<RepoCard />} />
          <Route path="/login"     element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <AIChat />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isFullScreenPage && <Footer />}
      {!isFullScreenPage && <ChatbotWidget />}
      {!isFullScreenPage && <WhatsAppButton />}
    </>
  );
}
