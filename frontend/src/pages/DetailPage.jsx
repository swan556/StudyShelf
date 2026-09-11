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
        setError(err.message);
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
      <button className="secondary" onClick={() => navigate(-1)} style={{ marginBottom: "2rem" }}>
        ← Back to Resources
      </button>
      
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          <p>Loading details...</p>
        </div>
      )}
      
      {error && (
        <div style={{ background: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.5)", color: "#dc2626", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
          <strong>Error: </strong> {error}
        </div>
      )}
      
      {!loading && !error && <ResourceDetail resource={resource} />}
    </div>
  );
}

export default DetailPage;
