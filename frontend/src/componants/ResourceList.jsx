import ResourceCard from "./ResourceCard";

function ResourceList({ resources }) {
  if (resources.length === 0) {
    return <p>no resources found</p>;
  }
  return (
    <div>
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
}

export default ResourceList;
