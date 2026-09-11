import GithubMetadata from "./GithubMetadata";

function ResourceDetail({ resource }) {
  if (!resource) return null;

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "2rem", boxShadow: "var(--shadow-sm)" }} className="animate-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: "700" }}>{resource.title}</h2>
        {resource.favorite && <span style={{ fontSize: "1.5rem" }} title="Favorite">⭐</span>}
      </div>
      
      <p style={{ margin: "0 0 1.5rem 0", fontSize: "1.1rem" }}>
        <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
          {resource.url} <span>↗</span>
        </a>
      </p>
      
      <div style={{ background: "var(--bg-color)", padding: "1.5rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "var(--text-primary)" }}>Description</h3>
        <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>{resource.description || "No description provided."}</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>Category</span>
          <span className="badge">{resource.category}</span>
        </div>
        <div>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>Tags</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {resource.tags.length > 0 ? resource.tags.map(tag => <span key={tag} className="tag">#{tag}</span>) : <span className="tag">None</span>}
          </div>
        </div>
        <div>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>Added</span>
          <span style={{ color: "var(--text-primary)" }}>{new Date(resource.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      <GithubMetadata url={resource.url} />
    </div>
  );
}

export default ResourceDetail;
