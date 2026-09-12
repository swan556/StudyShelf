import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";
import "./App.css";

function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <BrowserRouter>
        <nav className="navbar">
          <Link to="/" className="logo-badge">
            <div className="logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                <path d="M6 6h10"/>
                <path d="M6 10h10"/>
                <path d="M6 14h6"/>
              </svg>
            </div>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span className="logo-text">StudyShelf</span>
              <span className="logo-sub">Archive</span>
            </div>
          </Link>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <Link 
              to="/" 
              style={{ 
                fontSize: "0.9rem", 
                fontWeight: "600", 
                color: "var(--text-secondary)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Shelf Index
            </Link>
          </div>
        </nav>

        <main
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.5rem 4rem", width: "100%", flex: 1 }}
          className="animate-in"
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/resources/:id" element={<DetailPage />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p style={{ margin: 0, letterSpacing: "0.02em" }}>
            <strong>StudyShelf</strong> — A personal catalog for engineering papers, guides, and technical bookmarks.
          </p>
        </footer>
      </BrowserRouter>
    </div>
  );
}

export default App;
