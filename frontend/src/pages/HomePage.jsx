import { useEffect, useState } from "react";
import { fetchResources } from "../api";
import SearchBar from "../componants/SearchBar";
import ResourceList from "../componants/ResourceList";
import AddResourceForm from "../componants/AddResourceForm";

function HomePage() {
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchResources();
        if (!cancelled) {
          setResources(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
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
  }, []);

  const handleResourceAdd = (newResource) => {
    setResources((prev) => [newResource, ...prev]);
    setShowAddForm(false);
  };

  const filteredResources = resources.filter((r) => {
    const q = searchQuery.toLowerCase();

    return (
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700" }}>Your Resources</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Manage and discover your technical learning materials.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Add Resource"}
        </button>
      </div>

      {showAddForm && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1.5rem", marginBottom: "2rem", boxShadow: "var(--shadow-sm)" }} className="animate-in">
          <AddResourceForm onResourceAdded={handleResourceAdd} />
        </div>
      )}

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          <p>Loading resources...</p>
        </div>
      )}
      
      {error && (
        <div style={{ background: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.5)", color: "#dc2626", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem" }}>
          <strong>Error: </strong> {error}
        </div>
      )}
      
      {!loading && !error && (
        <div style={{ marginTop: "2rem" }}>
          <ResourceList resources={filteredResources} />
        </div>
      )}
    </div>
  );
}

export default HomePage;
