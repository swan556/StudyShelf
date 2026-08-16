import { useParams, useNavigate } from "react-router-dom";
import ResourceDetail from "../componants/ResourceDetail";
import { fetchResourceByID } from "../api";
import { useEffect, useState } from "react";

function DetailPage() {
  const { id } = useParams(); // to get id from the url
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
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
        Back
      </button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && <ResourceDetail resource={resource} />}
    </div>
  );
}

export default DetailPage;
