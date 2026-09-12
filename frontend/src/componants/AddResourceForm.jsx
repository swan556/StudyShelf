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
      setError("Please provide at least a title and a valid web URL.");
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
        description: description.trim() || "No notes recorded yet.",
        category: category.trim() || "General",
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
      setError(err.message || "Failed to save resource to the shelf.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: "0 0 0.35rem 0", fontSize: "1.5rem" }}>Catalog a New Resource</h2>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.92rem" }}>
          Record an insightful guide, documentation set, or repository into your archive.
        </p>
      </div>

      {error && (
        <div style={{
          background: "#FEF2F2",
          border: "1px solid #FCA5A5",
          color: "#991B1B",
          padding: "0.85rem 1rem",
          borderRadius: "var(--radius-sm)",
          marginBottom: "1.25rem",
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.4rem", color: "var(--text-primary)" }}>
              Title <span style={{ color: "var(--accent-primary)" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Designing Data-Intensive Applications"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%" }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.4rem", color: "var(--text-primary)" }}>
              Resource URL <span style={{ color: "var(--accent-primary)" }}>*</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{ width: "100%" }}
              required
            />
          </div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.4rem", color: "var(--text-primary)" }}>
              Shelf Section / Category
            </label>
            <input
              type="text"
              placeholder="e.g., Systems, Architecture, Frontend"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.4rem", color: "var(--text-primary)" }}>
              Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g., distributed, rust, consensus"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        </div>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.4rem", color: "var(--text-primary)" }}>
            Notes &amp; Key Takeaways
          </label>
          <textarea
            placeholder="Why is this resource worth keeping? Summarize important concepts, bookmarks, or takeaways..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ width: "100%", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            style={{ minWidth: "160px" }}
          >
            {isSubmitting ? (
              <>
                <span className="craft-spinner">●</span>
                Cataloging...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Add to Shelf
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddResourceForm;
