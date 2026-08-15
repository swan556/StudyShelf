# StudyShelf -- Hands-On Learning Guide

## Part 1: React Meets FastAPI

> **Your level:** Comfortable with React syntax, hooks, and forms. Comfortable with FastAPI syntax. Know database theory. Know almost nothing about networking.
> 
> **Goal by end of Part 1:** A working React app that talks to a FastAPI backend over HTTP. You can view, search, and add learning resources.

---

## Table of Contents

1. [What We Are Building](#what-we-are-building)
2. [The Big Picture: How Browser and Server Talk](#the-big-picture)
3. [Project Setup](#project-setup)
4. [Backend: FastAPI](#backend-fastapi)
5. [Frontend: React](#frontend-react)
6. [Connecting the Two](#connecting-the-two)
7. [Common Bugs & How to Debug Them](#common-bugs)
8. [Part 1 Complete](#part-1-complete)

---

## What We Are Building

**StudyShelf** is your personal learning-resource manager.

A resource looks like this:

```json
{
  "id": 1,
  "title": "React Docs",
  "url": "https://react.dev",
  "description": "Official React documentation",
  "category": "Frontend",
  "tags": ["react", "docs"],
  "favorite": false,
  "created_at": "2026-08-14T10:00:00",
  "updated_at": "2026-08-14T10:00:00"
}
```

By the end of Part 1 you will be able to:
- See a list of resources
- Search/filter them
- Add a new resource
- View resource details
- See loading, error, and empty states

We will **not** use a database yet. We will store resources in a Python list in memory. This keeps Part 1 focused on the communication between React and FastAPI.

---

## The Big Picture

Before we write code, you need to understand how your browser and your Python server talk to each other.

### 1. Client and Server

- **Client** = your React app running in the browser. It asks for things.
- **Server** = your FastAPI Python app. It listens for requests and sends back responses.

They are two separate programs. They do not share memory. They do not share variables. They communicate by sending text messages over a network.

### 2. HTTP: The Language They Speak

HTTP (HyperText Transfer Protocol) is the format of those text messages.

An **HTTP Request** from React to FastAPI looks like this under the hood:

```
POST /api/resources HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{"title":"React Docs","url":"https://react.dev"}
```

An **HTTP Response** from FastAPI back to React looks like this:

```
HTTP/1.1 200 OK
Content-Type: application/json

{"id":1,"title":"React Docs","url":"https://react.dev"}
```

**Key parts of a request:**
- **Method** (`GET`, `POST`, `PUT`, `DELETE`): what action you want
- **Path** (`/api/resources`): the "address" on the server
- **Headers** (`Content-Type`, `Host`): metadata about the request
- **Body**: the actual data (only for `POST`/`PUT`)

**Key parts of a response:**
- **Status code** (`200`, `404`, `500`): did it work?
- **Headers**: metadata
- **Body**: the data the server sends back

### 3. Ports and localhost

Your computer can run many programs that listen for network messages. A **port** is a number that identifies which program should receive the message.

- `localhost` means "this same computer"
- `localhost:8000` = "the program on this computer listening on port 8000"
- `localhost:5173` = "the program on this computer listening on port 5173" (Vite's default)

Your FastAPI server will run on port `8000`. Your React dev server will run on port `5173`. They are different programs on different ports. The browser talks to both.

### 4. REST

REST is a convention for designing URLs:

| Method | Path | Meaning |
|--------|------|---------|
| GET | `/api/resources` | List all resources |
| GET | `/api/resources/1` | Get resource with id=1 |
| POST | `/api/resources` | Create a new resource |
| PUT | `/api/resources/1` | Update resource with id=1 |
| DELETE | `/api/resources/1` | Delete resource with id=1 |

This is not enforced by any technology. It is a design choice that makes APIs predictable.

### 5. The Full Flow

Here is what happens when you click "Add Resource" in StudyShelf:

```
Browser  --POST /api/resources-->  FastAPI
:5173   {title, url...}           :8000
   ^                                  |
   |         HTTP/1.1 200 OK          |
   |         {id:1, title...}         |
   +----------------------------------+
```

**Why this matters for StudyShelf:** Every time you want to show data or save data, this round-trip happens. Your React state is temporary (gone on refresh). Your FastAPI in-memory list is temporary (gone when server restarts). In Part 2 we will make data permanent with a database.

### 6. CORS -- The Security Gate

Browsers have a security rule called **Same-Origin Policy**: a web page on `http://localhost:5173` is not allowed to make requests to `http://localhost:8000` by default. The ports are different, so the browser treats them as different "origins."

**CORS** (Cross-Origin Resource Sharing) is how the server tells the browser: "It is okay, I allow requests from that other origin."

We will configure FastAPI to allow requests from our React dev server. Without this, your browser will block every API call and you will see CORS errors in the console.

---

## Project Setup

### Folder Structure

Create a parent folder and two subfolders:

```
studyshelf/
├── backend/          # FastAPI
│   ├── main.py
│   └── models.py
└── frontend/         # React (Vite)
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api.js
    │   ├── components/
    │   │   ├── ResourceCard.jsx
    │   │   ├── ResourceList.jsx
    │   │   ├── SearchBar.jsx
    │   │   ├── AddResourceForm.jsx
    │   │   └── ResourceDetail.jsx
    │   └── pages/
    │       ├── HomePage.jsx
    │       └── DetailPage.jsx
    ├── index.html
    └── package.json
```

### Create the Backend

```bash
mkdir studyshelf && cd studyshelf
mkdir backend && cd backend
python -m venv venv

# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

pip install fastapi uvicorn
```

### Create the Frontend

```bash
cd ..
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom
```

---

## Backend: FastAPI

### Step 1: Pydantic Models

**What is Pydantic?** It is a Python library that validates data using Python type hints. When FastAPI receives JSON, Pydantic checks that the JSON matches the shape we expect.

**Why do we need it?** Without validation, a missing `title` or wrong data type could crash our server or corrupt our data. Pydantic gives us automatic error messages.

Create `backend/models.py`:

```python
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime


class ResourceBase(BaseModel):
    """Fields shared between creating and reading a resource."""
    title: str
    url: HttpUrl          # Pydantic validates this is a real URL
    description: str = ""
    category: str = "Uncategorized"
    tags: List[str] = []
    favorite: bool = False


class ResourceCreate(ResourceBase):
    """What the client sends when creating a resource."""
    pass


class Resource(ResourceBase):
    """What the server sends back -- includes generated fields."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

**Key design choice:** We split `ResourceBase`, `ResourceCreate`, and `Resource` because the client should not send `id` or `created_at`. The server generates those. This pattern prevents bugs where a client might try to set its own ID.

### Step 2: In-Memory Store

Create `backend/main.py`:

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime
from models import Resource, ResourceCreate

app = FastAPI(title='StudyShelf API')

# --- CORS ---------------------------------------------
# Allow our React dev server to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],   # Allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],   # Allow any headers
)

# --- In-Memory Data Store -----------------------------
# A list of Resource objects. Gone when server restarts.
_resources: List[Resource] = []
_next_id = 1


def _now() -> datetime:
    return datetime.utcnow()


# --- Routes -------------------------------------------

@app.get("/api/resources", response_model=List[Resource])
def list_resources() -> List[Resource]:
    """GET /api/resources -- return all resources."""
    return _resources


@app.get("/api/resources/{resource_id}", response_model=Resource)
def get_resource(resource_id: int) -> Resource:
    """GET /api/resources/1 -- return one resource by ID."""
    for r in _resources:
        if r.id == resource_id:
            return r
    raise HTTPException(status_code=404, detail="Resource not found")


@app.post("/api/resources", response_model=Resource, status_code=201)
def create_resource(data: ResourceCreate) -> Resource:
    """POST /api/resources -- create a new resource."""
    global _next_id
    new_resource = Resource(
        id=_next_id,
        title=data.title,
        url=data.url,
        description=data.description,
        category=data.category,
        tags=data.tags,
        favorite=data.favorite,
        created_at=_now(),
        updated_at=_now(),
    )
    _resources.append(new_resource)
    _next_id += 1
    return new_resource
```

**Architecture note:** We keep the store as a module-level variable (`_resources`). For a one-night project this is fine. In Part 2 we will replace this with a database.

### Step 3: Run the Server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

- `main:app` = "the variable `app` inside `main.py`"
- `--reload` = restart server when code changes
- `--port 8000` = listen on port 8000

Test it in your browser or with curl:

```bash
curl http://localhost:8000/api/resources
# Expected: []

curl -X POST http://localhost:8000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"title":"React Docs","url":"https://react.dev","description":"Official docs","category":"Frontend","tags":["react"]}'
# Expected: JSON with id:1

curl http://localhost:8000/api/resources
# Expected: array with one item
```

FastAPI also auto-generates interactive docs at `http://localhost:8000/docs`.

---

## Frontend: React

### Step 1: API Layer

**Why separate API calls from components?**
- Components should focus on UI, not network details.
- If the API URL changes, you change it in one place.
- You can add request/response logging in one place.

Create `frontend/src/api.js`:

```javascript
const API_BASE = "http://localhost:8000/api";

/**
 * Helper to handle HTTP errors.
 * fetch() does NOT throw on 404 or 500 -- only on network failure.
 * We manually check response.ok.
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

export async function fetchResourceById(id) {
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
```

**Key concept: async/await**
- Network requests take time. JavaScript does not wait by default.
- `async` marks a function as "this contains asynchronous work."
- `await` pauses execution inside that function until the promise resolves.
- `fetch()` returns a Promise. `await fetch(...)` waits for the HTTP response to arrive.

### Step 2: Components

#### ResourceCard.jsx

**What is a component?** A reusable piece of UI. It receives data through **props** and returns JSX.

**Why props?** Props make components reusable and testable. The parent decides what data to show; the card only knows how to display it.

Create `frontend/src/components/ResourceCard.jsx`:

```jsx
import { Link } from "react-router-dom";

function ResourceCard({ resource }) {
  return (
    <div className="resource-card" style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem", borderRadius: "8px" }}>
      <h3>
        <Link to={`/resources/${resource.id}`}>{resource.title}</Link>
      </h3>
      <p>{resource.description || "No description"}</p>
      <div>
        <span style={{ background: "#eee", padding: "2px 8px", borderRadius: "4px", fontSize: "0.85rem" }}>
          {resource.category}
        </span>
        {resource.favorite && <span style={{ marginLeft: "8px" }}>⭐</span>}
      </div>
      <div style={{ marginTop: "0.5rem" }}>
        {resource.tags.map((tag) => (
          <span key={tag} style={{ marginRight: "6px", fontSize: "0.8rem", color: "#666" }}>
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ResourceCard;
```

**Key concept: Lists and Keys**
- When you render a list with `.map()`, React needs a `key` prop on each item.
- The `key` helps React identify which items changed, were added, or removed.
- Use a stable unique ID from your data, **not** the array index (unless the list never reorders).

#### SearchBar.jsx

Create `frontend/src/components/SearchBar.jsx`:

```jsx
function SearchBar({ value, onChange }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        placeholder="Search resources..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
      />
    </div>
  );
}

export default SearchBar;
```

**Key concept: Controlled Input**
- The input's `value` comes from React state (via props).
- The `onChange` handler updates that state.
- React "controls" the input. This means the input always reflects your state, and you can filter/transform the value before updating.

#### ResourceList.jsx

Create `frontend/src/components/ResourceList.jsx`:

```jsx
import ResourceCard from "./ResourceCard";

function ResourceList({ resources }) {
  if (resources.length === 0) {
    return <p>No resources found.</p>;
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
```

#### AddResourceForm.jsx

Create `frontend/src/components/AddResourceForm.jsx`:

```jsx
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
    e.preventDefault(); // Stop browser from reloading the page
    setError(null);

    if (!title.trim() || !url.trim()) {
      setError("Title and URL are required.");
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
        description: description.trim(),
        category: category.trim() || "Uncategorized",
        tags,
        favorite: false,
      });
      onResourceAdded(newResource);
      // Reset form
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
    <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
      <h2>Add Resource</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "0.5rem" }}>
        <input
          type="text"
          placeholder="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <input
          type="url"
          placeholder="URL *"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Resource"}
      </button>
    </form>
  );
}

export default AddResourceForm;
```

**Key concept: Form State**
- Each input has its own `useState`.
- `e.preventDefault()` stops the browser's default form submission (which would reload the page).
- We validate before sending.
- We track `isSubmitting` to disable the button and show feedback.
- We track `error` to show the user what went wrong.

#### ResourceDetail.jsx

Create `frontend/src/components/ResourceDetail.jsx`:

```jsx
function ResourceDetail({ resource }) {
  if (!resource) return null;

  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>{resource.title}</h2>
      <p>
        <a href={resource.url} target="_blank" rel="noopener noreferrer">
          {resource.url}
        </a>
      </p>
      <p>{resource.description || "No description provided."}</p>
      <p><strong>Category:</strong> {resource.category}</p>
      <p><strong>Tags:</strong> {resource.tags.join(", ") || "None"}</p>
      <p><strong>Favorite:</strong> {resource.favorite ? "Yes ⭐" : "No"}</p>
      <p style={{ fontSize: "0.85rem", color: "#666" }}>
        Created: {new Date(resource.created_at).toLocaleString()}
      </p>
    </div>
  );
}

export default ResourceDetail;
```

### Step 3: Pages

#### HomePage.jsx

Create `frontend/src/pages/HomePage.jsx`:

```jsx
import { useState, useEffect } from "react";
import { fetchResources } from "../api";
import SearchBar from "../components/SearchBar";
import ResourceList from "../components/ResourceList";
import AddResourceForm from "../components/AddResourceForm";

function HomePage() {
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect: run side effects (like API calls) outside of render
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

    // Cleanup: if component unmounts before fetch finishes, ignore the result
    return () => {
      cancelled = true;
    };
  }, []); // Empty dependency array = run once on mount

  const handleResourceAdded = (newResource) => {
    setResources((prev) => [newResource, ...prev]);
  };

  const filteredResources = resources.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <h1>StudyShelf</h1>
      <AddResourceForm onResourceAdded={handleResourceAdded} />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {loading && <p>Loading resources...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && (
        <ResourceList resources={filteredResources} />
      )}
    </div>
  );
}

export default HomePage;
```

**Key concept: useEffect**
- React components should be pure: given the same props/state, they should return the same JSX.
- API calls are **side effects** -- they reach outside React.
- `useEffect` is the hook for side effects.
- The dependency array `[]` means "run this effect once when the component mounts."
- The cleanup function (`return () => { cancelled = true }`) prevents setting state on an unmounted component, which causes a React warning.

**Key concept: State Placement**
- `resources` lives in `HomePage` because both `SearchBar` and `ResourceList` need it.
- `searchQuery` lives in `HomePage` because it filters the list.
- Form inputs live inside `AddResourceForm` because no other component needs them.
- Rule: keep state as low in the tree as possible, but as high as needed.

**Key concept: Conditional Rendering**
- `loading && <p>Loading...</p>` -- only show if loading is true.
- `error && <p>Error...</p>` -- only show if there is an error.
- `!loading && !error && <ResourceList ... />` -- only show the list when we have data and no error.
- This gives the user clear feedback at every stage.

#### DetailPage.jsx

Create `frontend/src/pages/DetailPage.jsx`:

```jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchResourceById } from "../api";
import ResourceDetail from "../components/ResourceDetail";

function DetailPage() {
  const { id } = useParams(); // Get :id from the URL
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchResourceById(id);
        if (!cancelled) {
          setResource(data);
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
  }, [id]); // Re-run if the ID in the URL changes

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
        Back
      </button>

      {loading && <p>Loading resource...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && <ResourceDetail resource={resource} />}
    </div>
  );
}

export default DetailPage;
```

### Step 4: Routing Setup

**What is React Router?** It lets you have multiple "pages" in a single-page app by changing the URL without reloading the browser.

Update `frontend/src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "1rem", borderBottom: "1px solid #ddd", marginBottom: "1rem" }}>
        <Link to="/" style={{ fontSize: "1.2rem", fontWeight: "bold", textDecoration: "none" }}>
          StudyShelf
        </Link>
      </nav>
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1rem" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/resources/:id" element={<DetailPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
```

Update `frontend/src/main.jsx`:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Connecting the Two

### Start Both Servers

**Terminal 1 -- Backend:**
```bash
cd studyshelf/backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000
```

**Terminal 2 -- Frontend:**
```bash
cd studyshelf/frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

### What Should Happen

1. The React app mounts.
2. `useEffect` in `HomePage` runs.
3. `fetchResources()` sends `GET http://localhost:8000/api/resources`.
4. FastAPI receives it, returns `[]`.
5. React sets `resources = []`, `loading = false`.
6. You see "No resources found."
7. You fill the form and click "Add Resource."
8. `createResource()` sends `POST /api/resources` with JSON body.
9. FastAPI validates with Pydantic, creates the object, appends to `_resources`, returns it.
10. React adds it to the list. You see the new card.
11. You click the title. React Router navigates to `/resources/1`.
12. `DetailPage` mounts, fetches `GET /api/resources/1`, shows details.

---

## Common Bugs & How to Debug Them

### 1. CORS Error in Browser Console

**Symptom:** `Access to fetch at 'http://localhost:8000/...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Fix:** Make sure CORS middleware is added in `main.py` with the correct origin.

**Debug tip:** Open the Network tab in DevTools. If the request shows as "blocked" with no response body, it is almost always CORS.

### 2. Backend Not Running

**Symptom:** `TypeError: Failed to fetch` or `NetworkError`

**Fix:** Check that `uvicorn` is running. Check the port matches `API_BASE` in `api.js`.

**Debug tip:** Try `curl http://localhost:8000/api/resources` from your terminal. If that fails, the server is not running.

### 3. Pydantic Validation Error

**Symptom:** Backend returns `422 Unprocessable Entity`

**Fix:** Check that the JSON you send matches the Pydantic model. Common mistakes:
- Sending a number where a string is expected
- Missing required fields (`title`, `url`)
- Sending an invalid URL format

**Debug tip:** The FastAPI auto-docs at `/docs` show the exact schema. You can also look at the response body -- FastAPI includes detailed field-level error messages.

### 4. React State Not Updating

**Symptom:** You add a resource but the list does not show it.

**Fix:** Make sure you are using the functional update form:
```javascript
setResources((prev) => [newResource, ...prev]);
```
Not:
```javascript
setResources([newResource, ...resources]); // May use stale value
```

### 5. Infinite Re-render Loop

**Symptom:** Browser freezes, console shows thousands of requests.

**Fix:** You probably called `setState` directly inside the component body (not inside `useEffect` or an event handler). Move API calls into `useEffect`.

### 6. "Cannot read property of undefined"

**Symptom:** Crash when accessing `resource.title` before data loads.

**Fix:** Always check `loading` or `resource` before rendering. Or use optional chaining: `resource?.title`.

---

## PART 1 COMPLETE -- STOP HERE

Do not proceed to database, editing, deleting, or GitHub metadata yet.

---

## Verification Checklist

Before moving on, verify all of the following:

- [ ] `backend/` runs with `uvicorn main:app --reload --port 8000`
- [ ] `frontend/` runs with `npm run dev`
- [ ] Opening `http://localhost:5173` shows the StudyShelf home page
- [ ] The page initially shows "Loading resources..." then "No resources found."
- [ ] I can fill the form and add a resource
- [ ] The new resource appears immediately in the list without refreshing the page
- [ ] I can add multiple resources
- [ ] The search bar filters resources by title, description, category, or tag
- [ ] Clicking a resource title navigates to a detail page
- [ ] The detail page shows all fields (title, URL, description, category, tags, favorite, created_at)
- [ ] The browser back button works
- [ ] If the backend is stopped, the frontend shows an error message (not a blank screen)
- [ ] If I try to add a resource without a title or URL, I see a validation error
- [ ] The FastAPI auto-docs at `http://localhost:8000/docs` show all three endpoints
- [ ] Using `curl` to hit the API directly returns the expected JSON

---

## Concepts You Should Now Understand

### Networking
- [ ] What a client and server are, and why they are separate programs
- [ ] What HTTP is, and the four parts of an HTTP request (method, path, headers, body)
- [ ] What an HTTP response status code means (200, 404, 422, 500)
- [ ] What `localhost` and ports are, and why React (5173) and FastAPI (8000) need different ports
- [ ] The complete request/response flow: Browser -> HTTP -> FastAPI -> JSON -> React
- [ ] What CORS is and why it exists

### Backend (FastAPI)
- [ ] How to define a Pydantic model and why splitting Create/Read models prevents bugs
- [ ] How to define GET and POST routes with FastAPI
- [ ] How FastAPI auto-validates request bodies using Pydantic
- [ ] How to return proper HTTP status codes (200, 201, 404)
- [ ] How to enable CORS with CORSMiddleware
- [ ] Why we use an in-memory list for now, and that data disappears on server restart

### Frontend (React)
- [ ] How to structure a React app with components, pages, and an API layer
- [ ] How props pass data down to child components
- [ ] How useState manages component memory
- [ ] How useEffect handles side effects like API calls
- [ ] Why useEffect needs a cleanup function and a dependency array
- [ ] How async/await works with fetch()
- [ ] Why fetch() does not throw on HTTP errors, and how to check response.ok
- [ ] What controlled inputs are and why we use them
- [ ] How to render lists with .map() and why key is required
- [ ] How conditional rendering (&&, ternary) shows different UI states
- [ ] How to implement loading, error, and empty states
- [ ] How React Router enables client-side navigation without page reloads
- [ ] How useParams reads URL parameters
- [ ] Where to place state (as low as possible, as high as necessary)

### Architecture & Engineering
- [ ] Why separating API calls into api.js is better than calling fetch() inside components
- [ ] Why form validation should happen on both client (UX) and server (security)
- [ ] How to debug CORS, network, and validation errors
- [ ] Why we do not overengineer a one-night project (no database yet, no complex state management)

---

*End of Part 1. Part 2 will introduce SQLite + SQLAlchemy for persistent storage, editing, deleting, and favorites.*
