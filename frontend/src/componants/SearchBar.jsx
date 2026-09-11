function SearchBar({ value, onChange }) {
  return (
    <div style={{ marginBottom: "2rem", position: "relative" }}>
      <input
        type="text"
        placeholder="Search by title, description, category, or tags..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "1rem 1.5rem", fontSize: "1rem", borderRadius: "100px", boxShadow: "var(--shadow-sm)" }}
      />
      <div style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }}>
        🔍
      </div>
    </div>
  );
}

export default SearchBar;
