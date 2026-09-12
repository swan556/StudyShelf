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

  const loadResources = async (isMountedRef) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchResources();
      if (!isMountedRef || isMountedRef.current) {
        setResources(data || []);
      }
    } catch (err) {
      if (!isMountedRef || isMountedRef.current) {
        setError(err.message || "Unable to reach the StudyShelf archive server.");
      }
    } finally {
      if (!isMountedRef || isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const isMounted = { current: true };
    loadResources(isMounted);

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleResourceAdd = (newResource) => {
    setResources((prev) => [newResource, ...prev]);
    setShowAddForm(false);
  };

  const filteredResources = resources.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q)) ||
      (Array.isArray(r.tags) && r.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  });

  return (
    <div>
      {/* Header Banner */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "2.25rem",
        flexWrap: "wrap",
        gap: "1.25rem",
        borderBottom: "1px solid var(--border)",
        paddingBottom: "1.75rem"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <span className="badge">Curated Collection</span>
            {!loading && resources.length > 0 && (
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "500" }}>
                • {resources.length} {resources.length === 1 ? "entry" : "entries"} on record
              </span>
            )}
          </div>
          <h1 style={{ margin: 0, fontSize: "2.4rem", lineHeight: "1.2" }}>Personal Shelf</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "1.05rem", maxWidth: "600px" }}>
            A hand-curated cabinet of technical guides, documentation, and engineering bookmarks.
          </p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={showAddForm ? "secondary" : ""}
          style={{ minWidth: "160px" }}
        >
          {showAddForm ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Close Cataloger
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Catalog Material
            </>
          )}
        </button>
      </div>

      {/* Cataloging Form Drawer */}
      {showAddForm && (
        <div 
          style={{ 
            background: "var(--surface)", 
            border: "1px solid var(--border)", 
            borderRadius: "var(--radius-lg)", 
            padding: "2rem", 
            marginBottom: "2.5rem", 
            boxShadow: "var(--shadow-md)" 
          }} 
          className="animate-in"
        >
          <AddResourceForm onResourceAdded={handleResourceAdd} />
        </div>
      )}

      {/* Search Input */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* Loading state */}
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
            Consulting the shelves...
          </p>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0 }}>
            Gathering cataloged guides and repositories.
          </p>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div style={{ 
          background: "#FEF2F2", 
          border: "1px solid #FCA5A5", 
          color: "#991B1B", 
          padding: "1.25rem 1.5rem", 
          borderRadius: "var(--radius-md)", 
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <strong style={{ display: "block", marginBottom: "0.25rem" }}>Unable to consult archive:</strong>
            <span style={{ fontSize: "0.95rem" }}>{error}</span>
          </div>
          <button 
            type="button" 
            onClick={() => loadResources(null)}
            className="secondary"
            style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
          >
            Retry Connection
          </button>
        </div>
      )}
      
      {/* Resource Grid */}
      {!loading && !error && (
        <div style={{ marginTop: "1rem" }}>
          <ResourceList resources={filteredResources} searchQuery={searchQuery} />
        </div>
      )}
    </div>
  );
}

export default HomePage;
