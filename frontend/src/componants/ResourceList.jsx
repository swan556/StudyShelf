import ResourceCard from "./ResourceCard";

function ResourceList({ resources }) {
  if (resources.length === 0) {
    return <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem" }}>no resources found</p>;
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
