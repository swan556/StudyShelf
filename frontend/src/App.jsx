import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";

function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <BrowserRouter>
        <nav className="navbar">
          <Link
            to="/"
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              textDecoration: "none",
              background: "linear-gradient(90deg, var(--accent-primary), #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            StudyShelf
          </Link>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link to="/" style={{ fontWeight: "500" }}>Home</Link>
          </div>
        </nav>

        <main
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem", width: "100%", flex: 1 }}
          className="animate-in"
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/resources/:id" element={<DetailPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
