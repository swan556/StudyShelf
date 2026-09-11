import { useState } from "react";
import { createResource } from "../api";

function AddResourceForm({ onResourceAdded }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !url.trim()) {
      setError("Title and URL are required");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setIsSubmitting(true);

    try {
      const newResource = await createResource({
        title: title.trim(),
        url: url.trim(),
        description: description.trim() || "no description found",
        category: category.trim() || "uncategorized",
        tags: tags,
        favorite: false,
      });

      onResourceAdded(newResource);

      // reset form
      setTitle("");
      setUrl("");
      setDescription("");
      setCategory("");
      setTagsInput("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: "1.5rem" }}>Add a New Resource</h2>
        {error && <p style={{ background: "rgba(220, 38, 38, 0.1)", color: "#dc2626", padding: "0.75rem", borderRadius: "6px", marginBottom: "1rem" }}>{error}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%" }}
          />
          <input
            type="url"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Category (e.g., Frontend)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "100%" }}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <textarea
            placeholder="Brief description of this resource..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ width: "100%", resize: "vertical" }}
          />
        </div>

        <button type="submit" disabled={isSubmitting} style={{ width: "100%", justifyContent: "center" }}>
          {isSubmitting ? "Adding Resource..." : "Save Resource"}
        </button>
      </form>
    </div>
  );
}

export default AddResourceForm;
