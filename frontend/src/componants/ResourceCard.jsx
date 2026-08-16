import { Link } from "react-router-dom";

function ResourceCard({ resource }) {
  return (
    <div
      className="resource-card"
      style={{
        border: "1px solid black",
        padding: "1rem",
        margin: "1rem",
        borderRadius: "8px",
      }}
    >
      <h3>
        <Link to={`/resources/${resource.id}`}>{resource.title}</Link>
      </h3>
      <p>{resource.description || "No description available."}</p>
      <div>
        <span
          style={{
            background: "#eee",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "0.85rem",
          }}
        >
          {resource.category || "Uncategorized"}
        </span>
        {resource.favorite && <span style={{ marginLeft: "8px" }}>⭐</span>}
      </div>
      <div>
        {resource.tags.map((tag) => (
          <span
            key={tag}
            style={{ marginRight: "6px", fontSize: "0.8rem", color: "#666" }}
          >
            #{tag}
          </span>
        ))}
        ;
      </div>
    </div>
  );
}

export default ResourceCard;
