function ResourceDetail({ resource }) {
  if (!resource) return null;

  return (
    <div
      style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}
    >
      <h2>{resource.title}</h2>
      <p>
        <a href={resource.url} target="_blank" rel="noopener noreferrer">
          {resource.url}
        </a>
      </p>
      <p>{resource.description || "no description provided"}</p>
      <p>
        <strong>Category: </strong> {resource.category}
      </p>
      <p>
        <strong>Tags: </strong>
        {resource.tags.join(", ") || "None"}
      </p>
      <p>{resource.favorite ? "⭐" : "☆"}</p>
      <p style={{ fontSize: "0.85rem", color: "#666" }}>
        Created: {new Date(resource.created_at).toLocaleString}
      </p>
    </div>
  );
}

export default ResourceDetail;
