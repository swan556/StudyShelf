function SearchBar({ value, onChange }) {
  return (
    <div style={{ marginBottom: "2rem", position: "relative" }}>
      <div style={{
        position: "absolute",
        left: "1.1rem",
        top: "50%",
        transform: "translateY(-50%)",
        color: "var(--text-muted)",
        display: "flex",
        alignItems: "center",
        pointerEvents: "none"
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>

      <input
        type="text"
        placeholder="Search shelf by title, subject, tags, or notes..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "0.95rem 3rem 0.95rem 2.8rem",
          fontSize: "1rem",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-sm)",
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border)",
        }}
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          title="Clear search"
          style={{
            position: "absolute",
            right: "0.85rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            padding: "6px",
            boxShadow: "none",
            cursor: "pointer",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}

export default SearchBar;
