import { useState, useEffect } from "react";

function GithubMetadata({ url }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    // Check if URL is a GitHub repository URL
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)\/?$/;
    const match = url.match(githubRegex);
    
    if (!match) return; // Not a github URL, don't fetch

    const owner = match[2];
    const repo = match[3].replace(/\.git$/, ''); // Remove .git if present

    let cancelled = false;

    async function fetchGithubData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!response.ok) {
          throw new Error(`GitHub API returned status ${response.status}`);
        }
        const repoData = await response.json();
        if (!cancelled) {
          setData(repoData);
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

    fetchGithubData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!url) return null;
  const isGithub = /^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)\/?$/.test(url);
  if (!isGithub) return null;

  return (
    <div style={{
      marginTop: "1.5rem",
      padding: "1.5rem",
      background: "var(--surface-warm)",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.1rem" }}>
        <svg height="20" viewBox="0 0 16 16" width="20" fill="currentColor" style={{ color: "var(--text-primary)" }}>
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
        </svg>
        <h4 style={{ margin: 0, fontFamily: "'Lora', serif", color: "var(--text-primary)", fontSize: "1.05rem" }}>
          Repository Dossier
        </h4>
      </div>
      
      {loading && (
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="craft-spinner">●</span>
          Fetching live repository metrics...
        </p>
      )}

      {error && (
        <p style={{ margin: 0, color: "#991B1B", fontSize: "0.85rem" }}>
          Could not sync live stats: {error}
        </p>
      )}
      
      {data && (
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          {/* Stars */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }} title="Stargazers">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span><strong style={{ color: "var(--text-primary)" }}>{data.stargazers_count.toLocaleString()}</strong> stars</span>
          </div>

          {/* Forks */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }} title="Forks">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="6" y1="3" x2="6" y2="15"/>
              <circle cx="18" cy="6" r="3"/>
              <circle cx="6" cy="18" r="3"/>
              <path d="M18 9a9 9 0 0 1-9 9"/>
            </svg>
            <span><strong style={{ color: "var(--text-primary)" }}>{data.forks_count.toLocaleString()}</strong> forks</span>
          </div>

          {/* Issues */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }} title="Open Issues">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span><strong style={{ color: "var(--text-primary)" }}>{data.open_issues_count.toLocaleString()}</strong> issues</span>
          </div>

          {/* Language */}
          {data.language && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }} title="Primary Language">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
              <span><strong style={{ color: "var(--text-primary)" }}>{data.language}</strong></span>
            </div>
          )}

          {/* License */}
          {data.license && data.license.name && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }} title="License">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <span><strong style={{ color: "var(--text-primary)" }}>{data.license.name}</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GithubMetadata;
