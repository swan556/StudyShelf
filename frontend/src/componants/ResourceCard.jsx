import { Link } from "react-router-dom";

function ResourceCard({ resource }) {
  return (
    <div className="resource-card animate-in">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
        <span className="badge">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
          </svg>
          {resource.category || "General"}
        </span>

        {resource.favorite && (
          <span 
            title="Bookmarked as Favorite" 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              color: "#D97706",
              filter: "drop-shadow(0 1px 2px rgba(217, 119, 6, 0.2))"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </span>
        )}
      </div>

      <h3 className="resource-card-title">
        <Link to={`/resources/${resource.id}`}>{resource.title}</Link>
      </h3>

      <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", flex: 1, margin: 0, lineHeight: "1.55" }}>
        {resource.description || "No notes recorded yet."}
      </p>
      
      {resource.tags && resource.tags.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "auto", paddingTop: "0.5rem" }}>
          {resource.tags.map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}
      
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        borderTop: "1px solid var(--border-subtle)", 
        paddingTop: "0.75rem",
        marginTop: "0.25rem",
        fontSize: "0.82rem"
      }}>
        <Link 
          to={`/resources/${resource.id}`} 
          style={{ 
            fontWeight: "600", 
            color: "var(--accent-primary)",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          View Details
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>
        {resource.url && (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Visit ${resource.url}`}
            style={{ 
              color: "var(--text-muted)", 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "3px" 
            }}
          >
            Direct Link
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

export default ResourceCard;
