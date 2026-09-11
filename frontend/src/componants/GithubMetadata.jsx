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
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
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
      background: "var(--bg-color)",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
        <svg height="24" viewBox="0 0 16 16" version="1.1" width="24" aria-hidden="true" fill="currentColor">
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
        </svg>
        <h4 style={{ margin: 0, color: "var(--text-primary)", fontSize: "1.1rem" }}>GitHub Repository Metadata</h4>
      </div>
      
      {loading && <p style={{ margin: 0, color: "var(--text-secondary)" }}>Loading repository data...</p>}
      {error && <p style={{ margin: 0, color: "#dc2626" }}>Error loading data: {error}</p>}
      
      {data && (
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            ⭐ <strong style={{ color: "var(--text-primary)" }}>{data.stargazers_count}</strong> Stars
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            🍴 <strong style={{ color: "var(--text-primary)" }}>{data.forks_count}</strong> Forks
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            🐞 <strong style={{ color: "var(--text-primary)" }}>{data.open_issues_count}</strong> Issues
          </div>
          {data.language && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              💻 <strong style={{ color: "var(--text-primary)" }}>{data.language}</strong>
            </div>
          )}
          {data.license && data.license.name && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              📄 <strong style={{ color: "var(--text-primary)" }}>{data.license.name}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GithubMetadata;
