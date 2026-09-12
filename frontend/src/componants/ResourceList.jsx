import ResourceCard from "./ResourceCard";

function ResourceList({ resources, searchQuery = "" }) {
  if (resources.length === 0) {
    const isSearching = searchQuery.trim().length > 0;

    return (
      <div 
        style={{ 
          textAlign: "center", 
          padding: "3.5rem 1.5rem", 
          background: "var(--surface)",
          border: "1px dashed var(--border)",
          borderRadius: "var(--radius-lg)",
          margin: "1rem 0 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem"
        }}
        className="animate-in"
      >
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "var(--surface-warm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--accent-brass)",
          border: "1px solid var(--border)"
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
            <path d="M12 6v8"/>
            <path d="M9 9h6"/>
          </svg>
        </div>

        {isSearching ? (
          <div>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", color: "var(--text-primary)" }}>
              No matches found for &ldquo;{searchQuery}&rdquo;
            </h3>
            <p style={{ color: "var(--text-secondary)", maxWidth: "420px", margin: "0 auto", fontSize: "0.95rem" }}>
              Check for spelling variations, try searching by category or tag, or reset your search query.
            </p>
          </div>
        ) : (
          <div>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", color: "var(--text-primary)" }}>
              The shelf is quiet. No resources saved yet.
            </h3>
            <p style={{ color: "var(--text-secondary)", maxWidth: "460px", margin: "0 auto", fontSize: "0.95rem" }}>
              Begin your personal collection by cataloging documentation, research papers, tools, or GitHub repositories above.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="resource-grid">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
}

export default ResourceList;
