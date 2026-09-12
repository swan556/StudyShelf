import GithubMetadata from "./GithubMetadata";

function ResourceDetail({ resource }) {
  if (!resource) return null;

  const formattedDate = resource.created_at
    ? new Date(resource.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unrecorded";

  return (
    <div 
      style={{ 
        background: "var(--surface)", 
        border: "1px solid var(--border)", 
        borderRadius: "var(--radius-lg)", 
        padding: "2.5rem", 
        boxShadow: "var(--shadow-md)",
        position: "relative"
      }} 
      className="animate-in"
    >
      {/* Category Stamp & Favorite Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="badge">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
            </svg>
            {resource.category || "General Reference"}
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>• Archive ID #{resource.id}</span>
        </div>

        {resource.favorite && (
          <div 
            title="Bookmarked as Favorite"
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px",
              padding: "4px 10px",
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              borderRadius: "20px",
              color: "#92400E",
              fontSize: "0.8rem",
              fontWeight: "600"
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Starred Reference
          </div>
        )}
      </div>

      {/* Main Title */}
      <h1 style={{ margin: "0 0 1rem 0", fontSize: "2.2rem", lineHeight: "1.25" }}>
        {resource.title}
      </h1>
      
      {/* Direct link pill */}
      <div style={{ marginBottom: "2rem" }}>
        <a 
          href={resource.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "0.5rem",
            fontSize: "0.95rem",
            background: "var(--surface-warm)",
            border: "1px solid var(--border)",
            padding: "0.5rem 1rem",
            borderRadius: "var(--radius-sm)",
            fontWeight: "500",
            wordBreak: "break-all"
          }}
        >
          <span>{resource.url}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>
      
      {/* Notes & Summary Box */}
      <div style={{ 
        background: "var(--bg-color)", 
        padding: "1.75rem", 
        borderRadius: "var(--radius-md)", 
        marginBottom: "2rem",
        border: "1px solid var(--border-subtle)"
      }}>
        <h3 style={{ margin: "0 0 0.65rem 0", fontSize: "1.1rem", color: "var(--text-primary)" }}>
          Notes &amp; Reference Annotations
        </h3>
        <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", margin: 0, fontSize: "1rem" }}>
          {resource.description || "No specific annotations have been recorded for this resource."}
        </p>
      </div>

      {/* Meta Specs Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1.5rem", 
        marginBottom: "2.5rem",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "1.5rem 0"
      }}>
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "700" }}>
            Classification
          </span>
          <span className="badge">{resource.category || "General"}</span>
        </div>

        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "700" }}>
            Cataloged On
          </span>
          <span style={{ color: "var(--text-primary)", fontWeight: "500", fontSize: "0.95rem" }}>
            {formattedDate}
          </span>
        </div>

        <div style={{ gridColumn: "span 2" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "700" }}>
            Subject Tags
          </span>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {resource.tags && resource.tags.length > 0 ? (
              resource.tags.map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No tags assigned</span>
            )}
          </div>
        </div>
      </div>
      
      {/* GitHub Repository Dossier */}
      <GithubMetadata url={resource.url} />
    </div>
  );
}

export default ResourceDetail;
