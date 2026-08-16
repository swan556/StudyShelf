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

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchResources();
        if (!cancelled) {
          setResources(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleResourceAdd = (newResource) => {
    setResources((prev) => [newResource, ...prev]);
  };
  const filteredResources = resources.filter((r) => {
    const q = searchQuery.toLowerCase();

    return (
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <h1>StudyShelf</h1>
      <AddResourceForm onResourceAdded={handleResourceAdd} />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {loading && <p>Loading resources</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && <ResourceList resources={filteredResources} />}
    </div>
  );
}

export default HomePage;
