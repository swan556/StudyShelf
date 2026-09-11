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
      marginTop: "1rem",
      padding: "1rem",
      background: "#f6f8fa",
      borderRadius: "6px",
      border: "1px solid #d0d7de"
    }}>
      <h4 style={{ margin: "0 0 0.5rem 0", color: "#24292f" }}>GitHub Repository Metadata</h4>
      {loading && <p style={{ margin: 0, color: "#57606a" }}>Loading repository data...</p>}
      {error && <p style={{ margin: 0, color: "#cf222e" }}>Error loading data: {error}</p>}
      {data && (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.9rem", color: "#57606a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            ⭐ <strong>{data.stargazers_count}</strong> Stars
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            🍴 <strong>{data.forks_count}</strong> Forks
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            🐞 <strong>{data.open_issues_count}</strong> Issues
          </div>
          {data.language && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              💻 <strong>{data.language}</strong>
            </div>
          )}
          {data.license && data.license.name && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              📄 <strong>{data.license.name}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GithubMetadata;
