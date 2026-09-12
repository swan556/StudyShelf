const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Helper to handle HTTP errors
 * fetch() does not throw error codes, it directly has network failure
 * we manually have to check the response
 */

async function handleResponse(response) {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function fetchResources() {
  const res = await fetch(`${API_BASE}/resources`);
  return handleResponse(res);
}

export async function fetchResourceByID(id) {
  const res = await fetch(`${API_BASE}/resources/${id}`);
  return handleResponse(res);
}

export async function createResource(resourceData) {
  const res = await fetch(`${API_BASE}/resources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resourceData),
  });
  return handleResponse(res);
}
