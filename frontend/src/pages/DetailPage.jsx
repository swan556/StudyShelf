import { useParams, useNavigate } from "react-router-dom";
import ResourceDetail from "../componants/ResourceDetail";
import { fetchResourceByID } from "../api";
import { useEffect, useState } from "react";

function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        setLoading(true);
        const data = await fetchResourceByID(id);
        if (!cancelled) {
          setResource(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to retrieve this resource from the archive.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="animate-in">
      <div style={{ marginBottom: "2rem" }}>
        <button 
          className="secondary" 
          onClick={() => navigate(-1)} 
          style={{ fontSize: "0.9rem", padding: "0.55rem 1.1rem" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Return to Shelf
        </button>
      </div>
      
      {loading && (
        <div style={{ textAlign: "center", padding: "4.5rem 1rem", color: "var(--text-secondary)" }} className="animate-in">
          <div style={{
            width: "48px",
            height: "48px",
            margin: "0 auto 1.25rem",
            color: "var(--accent-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }} className="craft-spinner">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M6 6h10"/>
              <path d="M6 10h10"/>
            </svg>
          </div>
          <p style={{ fontFamily: "'Lora', serif", fontSize: "1.15rem", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 0.25rem 0" }}>
            Retrieving catalog record...
          </p>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0 }}>
            Fetching reference notes and repository metrics.
          </p>
        </div>
      )}
      
      {error && (
        <div style={{ 
          background: "#FEF2F2", 
          border: "1px solid #FCA5A5", 
          color: "#991B1B", 
          padding: "1.25rem 1.5rem", 
          borderRadius: "var(--radius-md)" 
        }}>
          <strong style={{ display: "block", marginBottom: "0.25rem" }}>Unable to locate record:</strong>
          <span>{error}</span>
        </div>
      )}
      
      {!loading && !error && <ResourceDetail resource={resource} />}
    </div>
  );
}

export default DetailPage;
