import { Link } from "react-router-dom";

function ResourceCard({ resource }) {
  return (
    <div className="resource-card animate-in">
      <h3 style={{ margin: 0, fontSize: "1.25rem", lineHeight: "1.2" }}>
        <Link to={`/resources/${resource.id}`}>{resource.title}</Link>
      </h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", flex: 1 }}>
        {resource.description || "No description available."}
      </p>
      
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <span className="badge">
          {resource.category || "Uncategorized"}
        </span>
        {resource.favorite && <span title="Favorite">⭐</span>}
      </div>
      
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "0.75rem" }}>
        {resource.tags.map((tag) => (
          <span key={tag} className="tag">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ResourceCard;
