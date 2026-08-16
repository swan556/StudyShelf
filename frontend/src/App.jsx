import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";

function App() {
  return (
    <div>
      <BrowserRouter>
        <nav
          style={{
            padding: "1rem",
            borderBottom: "1px solid #ddd",
            marginBottom: "1rem",
          }}
        >
          <Link
            to="/"
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            StudyShelf
          </Link>
        </nav>

        <main
          style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1rem" }}
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
