# StudyShelf -- Hands-On Learning Guide

## Part 2: Persistence, CRUD & Architecture

> **Prerequisite:** You have completed Part 1. The React frontend talks to FastAPI over HTTP. Resources live in an in-memory Python list.
>
> **Goal:** Replace the in-memory list with SQLite. Add full CRUD, search, filter, sort, and favorites. Restructure both frontend and backend into maintainable code.
>
> **Rule:** We build on top of Part 1. We do not restart.

---

## Table of Contents

1. [What Changes in Part 2](#what-changes)
2. [Backend Architecture](#backend-architecture)
3. [SQLite & SQLAlchemy](#sqlite-sqlalchemy)
4. [Pydantic Schemas](#pydantic-schemas)
5. [Service Layer](#service-layer)
6. [Routes & Dependency Injection](#routes)
7. [Query Parameters: Search, Filter, Sort](#query-params)
8. [React: Custom Hooks & When to Use Them](#react-hooks)
9. [React: Derived State & Component Design](#react-derived)
10. [React: CRUD UI](#react-crud)
11. [The Full Request Lifecycle](#lifecycle)
12. [Debugging Full-Stack](#debugging)
13. [Testing](#testing)
14. [Part 2 Complete](#part-2-complete)

---

## What Changes in Part 2

In Part 1, this was our stack:

```
React --HTTP--> FastAPI --Python list--> memory
```

In Part 2, it becomes:

```
React --HTTP--> FastAPI --SQLAlchemy--> SQLite
```

**What we add:**

- **SQLite** -- a file-based database. Data survives server restarts.
- **SQLAlchemy** -- a Python library that translates Python objects into SQL.
- **Service layer** -- business logic lives here, not in route functions.
- **Complete CRUD** -- Create, Read, Update, Delete.
- **Search / Filter / Sort** -- via query parameters.
- **Favorites** -- toggle a star on any resource.
- **Better React architecture** -- custom hooks, reusable components, derived state.

**What we remove:**

- The in-memory `_resources` list.
- Duplicated fetch logic scattered across components.

---

## Backend Architecture

### The Problem with Part 1

In Part 1, everything lived in `main.py`:

- Pydantic models
- The in-memory list
- Route handlers
- Business logic (find by ID, append to list)

For a prototype, this is fine. For anything larger, it becomes unmaintainable.

### The Layers We Need

A small but proper FastAPI backend has four layers:

| Layer        | File                    | Responsibility                                            |
| ------------ | ----------------------- | --------------------------------------------------------- |
| **Database** | `database.py`           | Connect to SQLite, create sessions, define the base class |
| **Model**    | `models.py`             | SQLAlchemy classes -- what the database tables look like  |
| **Schema**   | `schemas.py`            | Pydantic classes -- what the API accepts and returns      |
| **Service**  | `services/resources.py` | Business logic -- query, create, update, delete           |
| **Route**    | `routes/resources.py`   | FastAPI endpoints -- HTTP in, HTTP out                    |
| **Main**     | `main.py`               | Wire everything together                                  |

**Why separate them?**

- If you change from SQLite to PostgreSQL, only `database.py` and `models.py` change.
- If you change the API shape, only `schemas.py` changes.
- If you add caching or validation rules, only `services/resources.py` changes.
- Routes stay thin: they parse HTTP, call services, and return responses.

### The Three Representations of a Resource

This is the most important concept in Part 2. A resource exists in three different forms:

1. **Database Model** (`models.py`) -- SQLAlchemy object. Has `__tablename__`, columns, types. Knows nothing about HTTP or JSON.
2. **Pydantic Request Schema** (`schemas.py`) -- Validates what the client sends. Has `HttpUrl`, `min_length`, defaults.
3. **Pydantic Response Schema** (`schemas.py`) -- Shapes what the client receives. Includes `id`, `created_at`, `updated_at`.

**A beginner mistake:** Using the SQLAlchemy model directly as the API response. This leaks database details (like column names, internal IDs, or relationships) to the client. It also breaks if you rename a database column.

**Our rule:** Database models never leave the backend. They are converted to Pydantic response schemas before being sent over HTTP.

---

## SQLite & SQLAlchemy

### Concept

**SQLAlchemy** is an ORM (Object-Relational Mapper). You write Python classes, and SQLAlchemy generates SQL for you.

**SQLite** is a file-based SQL database. No separate server process. The data lives in a `.db` file on disk.

### Why StudyShelf Needs It

Right now, restarting the FastAPI server wipes all resources. With SQLite, resources persist.

### Design

We need:

- An engine (knows where the database file is)
- A session factory (creates database transactions)
- A base class (all models inherit from it)
- A dependency (`get_db`) that gives each request its own session

### Try It Yourself

Before looking at the code, answer: _Why do we give each HTTP request its own database session instead of sharing one global session?_

Think about what happens if two users add resources at the same time.

### Implementation

**CREATE FILE** `backend/database.py`:

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./studyshelf.db"

# check_same_thread=False is required for SQLite with FastAPI's dependency injection
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    # Yield a database session for each request, then close it.
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Understand the code:**

- `engine` -- the connection pool to SQLite. `check_same_thread=False` allows FastAPI's dependency injection to work correctly (each request may run on a different thread).
- `SessionLocal` -- a factory that creates session objects. A session is a transaction context. You make changes inside it, then call `commit()` to save.
- `Base` -- every SQLAlchemy model inherits from this. It tracks all tables.
- `get_db()` -- a generator that yields a session and guarantees cleanup. FastAPI calls this automatically for every request via `Depends(get_db)`.

**Why one session per request?** If two users add resources simultaneously, their changes must be isolated. If they shared one session, their transactions would collide. Also, sessions hold database locks and caches. Keeping them short-lived prevents memory leaks and lock contention.

**CREATE FILE** `backend/models.py`:

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from database import Base


class ResourceModel(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    description = Column(String, default="")
    category = Column(String, default="Uncategorized")
    tags = Column(String, default="")          # comma-separated for simplicity
    favorite = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

**Important note:** Storing tags as a comma-separated string is not normalized database design. In a production app, you would use a separate `tags` table with a many-to-many relationship. We are keeping it simple because Part 2's goal is architecture and CRUD, not advanced SQL schema design. You already know normalization theory; here we are trading purity for simplicity.

**Understand the code:**

- `__tablename__` -- the actual SQL table name.
- `Column(..., nullable=False)` -- SQL-level constraint. The database will reject inserts without a title.
- `server_default=func.now()` -- the database server sets the timestamp automatically.
- `onupdate=func.now()` -- the database updates the timestamp on every modification.

---

## Pydantic Schemas

### Concept

Pydantic schemas define the shape of JSON that goes in and out of the API.

### Why We Need Three Schemas

| Schema           | Purpose                         | Fields                                            |
| ---------------- | ------------------------------- | ------------------------------------------------- |
| `ResourceBase`   | Shared fields                   | title, url, description, category, tags, favorite |
| `ResourceCreate` | What the client sends to create | same as Base                                      |
| `ResourceUpdate` | What the client sends to update | all fields Optional                               |
| `Resource`       | What the server returns         | all Base fields + id, created_at, updated_at      |

**Why `ResourceUpdate` has all Optional fields?** Because `PATCH` means update only what you send. If you only send `{favorite: true}`, Pydantic must allow everything else to be missing.

### Implementation

**REPLACE FILE** `backend/schemas.py`:

```python
from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional
from datetime import datetime


class ResourceBase(BaseModel):
    title: str = Field(..., min_length=1)
    url: HttpUrl
    description: str = ""
    category: str = "Uncategorized"
    tags: List[str] = []
    favorite: bool = False


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    # All fields optional because PATCH only updates what you provide.
    title: Optional[str] = Field(None, min_length=1)
    url: Optional[HttpUrl] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    favorite: Optional[bool] = None


class Resource(ResourceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

**Understand the code:**

- `Field(..., min_length=1)` -- Pydantic validates that title is not empty.
- `ResourceUpdate` does not inherit from `ResourceBase` because that would make all fields required. Instead, it redeclares them as `Optional`.
- `from_attributes = True` -- tells Pydantic to read attributes from SQLAlchemy objects (e.g., `db_resource.title`) instead of dictionaries.

---

## Service Layer

### Concept

The service layer contains business logic. It knows how to query the database, enforce rules, and transform data.

### Why Not Put This in Routes?

A beginner dumps SQL directly into the route function. This works for one endpoint, but:

- You cannot reuse the logic (e.g., a CLI tool or admin panel needs the same logic).
- The route file becomes huge.
- Testing requires running the HTTP server instead of just calling a Python function.

**Rule:** Routes handle HTTP. Services handle business logic.

### Design

We need functions for:

- `get_resources(db, search, category, sort)` -- list with filtering
- `get_resource(db, id)` -- single item
- `create_resource(db, data)` -- insert
- `update_resource(db, id, data)` -- partial update
- `delete_resource(db, id)` -- remove

### Implementation

**CREATE FILE** `backend/services/__init__.py` (empty file)

**CREATE FILE** `backend/services/resources.py`:

```python
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import ResourceModel
from schemas import ResourceCreate, ResourceUpdate


def _tags_to_str(tags: List[str]) -> str:
    return ",".join(tags)


def _str_to_tags(s: Optional[str]) -> List[str]:
    if not s:
        return []
    return [t.strip() for t in s.split(",") if t.strip()]


def get_resources(
    db: Session,
    search: Optional[str] = None,
    category: Optional[str] = None,
    sort: Optional[str] = None,
) -> List[ResourceModel]:
    query = db.query(ResourceModel)

    if category:
        query = query.filter(ResourceModel.category.ilike(category))

    if search:
        pattern = f"%{search}%"
        search_filter = or_(
            ResourceModel.title.ilike(pattern),
            ResourceModel.description.ilike(pattern),
            ResourceModel.category.ilike(pattern),
            ResourceModel.tags.ilike(pattern),
        )
        query = query.filter(search_filter)

    if sort == "title":
        query = query.order_by(ResourceModel.title.asc())
    elif sort == "favorite":
        query = query.order_by(ResourceModel.favorite.desc(), ResourceModel.created_at.desc())
    else:
        query = query.order_by(ResourceModel.created_at.desc())

    return query.all()


def get_resource(db: Session, resource_id: int) -> Optional[ResourceModel]:
    return db.query(ResourceModel).filter(ResourceModel.id == resource_id).first()


def create_resource(db: Session, resource: ResourceCreate) -> ResourceModel:
    db_resource = ResourceModel(
        title=resource.title,
        url=str(resource.url),
        description=resource.description,
        category=resource.category,
        tags=_tags_to_str(resource.tags),
        favorite=resource.favorite,
    )
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource


def update_resource(
    db: Session, resource_id: int, updates: ResourceUpdate
) -> Optional[ResourceModel]:
    db_resource = get_resource(db, resource_id)
    if not db_resource:
        return None

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "url" and value is not None:
            value = str(value)
        if field == "tags" and value is not None:
            value = _tags_to_str(value)
        setattr(db_resource, field, value)

    db.commit()
    db.refresh(db_resource)
    return db_resource


def delete_resource(db: Session, resource_id: int) -> Optional[ResourceModel]:
    db_resource = get_resource(db, resource_id)
    if not db_resource:
        return None
    db.delete(db_resource)
    db.commit()
    return db_resource
```

**Understand the code:**

- `db.query(ResourceModel)` -- SQLAlchemy's query builder. It returns SQLAlchemy objects.
- `ilike()` -- case-insensitive SQL LIKE.
- `or_()` -- combines multiple WHERE clauses with OR.
- `exclude_unset=True` -- only includes fields the client actually sent. This is what makes PATCH work correctly.
- `setattr(db_resource, field, value)` -- dynamically sets attributes. Cleaner than an if-statement for every field.
- `db.commit()` -- writes the transaction to the database. Without this, nothing is saved.
- `db.refresh(db_resource)` -- reloads the object from the database so `created_at` and `updated_at` are populated.

**Common mistake:** Forgetting `db.commit()`. You add the object, return it, and wonder why the database is still empty. SQLAlchemy queues changes in memory until you commit.

---

## Routes & Dependency Injection

### Concept

**Dependency Injection (DI)** is when FastAPI automatically provides something a route function needs. Instead of creating a database session inside the route, you declare `db: Session = Depends(get_db)` and FastAPI calls `get_db()` for you.

### Why DI Matters

- Routes do not know _how_ to create a database session. They just ask for one.
- You can swap `get_db` with a test version that uses an in-memory database.
- FastAPI manages the lifecycle: the session is created before the route runs and closed after.

### Implementation

**CREATE FILE** `backend/routes/__init__.py` (empty file)

**CREATE FILE** `backend/routes/resources.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from schemas import Resource, ResourceCreate, ResourceUpdate
from services import resources as resource_service

router = APIRouter(prefix="/api/resources", tags=["resources"])


@router.get("", response_model=List[Resource])
def list_resources(
    search: Optional[str] = Query(None, description="Search in title, description, category, tags"),
    category: Optional[str] = Query(None, description="Filter by exact category"),
    sort: Optional[str] = Query(None, description="Sort by: created_at, title, favorite"),
    db: Session = Depends(get_db),
):
    return resource_service.get_resources(db, search=search, category=category, sort=sort)


@router.get("/{resource_id}", response_model=Resource)
def read_resource(resource_id: int, db: Session = Depends(get_db)):
    db_resource = resource_service.get_resource(db, resource_id)
    if db_resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return db_resource


@router.post("", response_model=Resource, status_code=201)
def create_resource(resource: ResourceCreate, db: Session = Depends(get_db)):
    return resource_service.create_resource(db, resource)


@router.patch("/{resource_id}", response_model=Resource)
def update_resource(
    resource_id: int,
    updates: ResourceUpdate,
    db: Session = Depends(get_db),
):
    db_resource = resource_service.update_resource(db, resource_id, updates)
    if db_resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return db_resource


@router.delete("/{resource_id}", status_code=204)
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    db_resource = resource_service.delete_resource(db, resource_id)
    if db_resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return None
```

**Understand the code:**

- `APIRouter(prefix="/api/resources")` -- all routes in this file automatically start with `/api/resources`.
- `Query(None, description="...")` -- declares a query parameter with docs.
- `db: Session = Depends(get_db)` -- FastAPI injects a database session.
- `raise HTTPException(status_code=404)` -- returns a proper HTTP 404 with a JSON error body.
- `status_code=204` on DELETE -- HTTP says success, no body to return.

**REPLACE FILE** `backend/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import resources

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="StudyShelf API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resources.router)
```

**Understand the code:**

- `Base.metadata.create_all(bind=engine)` -- creates the `resources` table if it does not exist. In production, you would use Alembic migrations instead.
- `app.include_router(resources.router)` -- mounts all routes from `routes/resources.py`.

### Verify

```bash
cd backend
source venv/bin/activate
pip install sqlalchemy

# Delete the old in-memory state; we now use SQLite
rm -f studyshelf.db

uvicorn main:app --reload --port 8000
```

Test:

```bash
curl http://localhost:8000/api/resources
# Expected: []

curl -X POST http://localhost:8000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"title":"React Docs","url":"https://react.dev","category":"Frontend","tags":["react"]}'
# Expected: JSON with id:1, created_at, updated_at

curl http://localhost:8000/api/resources
# Expected: array with one item

curl -X PATCH http://localhost:8000/api/resources/1 \
  -H "Content-Type: application/json" \
  -d '{"favorite":true}'
# Expected: {..., "favorite": true}

curl -X DELETE http://localhost:8000/api/resources/1
# Expected: empty body, status 204

curl http://localhost:8000/api/resources/1
# Expected: 404
```

**Common mistake:** Getting `ModuleNotFoundError` for `models` or `schemas`. Make sure you run `uvicorn` from inside the `backend/` directory, and that `backend/` is your working directory. Python's import path is relative to where you run the command.

---

## Query Parameters: Search, Filter, Sort

### Concept

There are three ways to send data to a server:

| Mechanism           | Used for                              | Example                          |
| ------------------- | ------------------------------------- | -------------------------------- |
| **Path parameter**  | Identifies a specific resource        | `/resources/1`                   |
| **Query parameter** | Filters, searches, sorts a collection | `/resources?search=react`        |
| **Request body**    | Creates or updates a resource         | `POST /resources` with JSON body |

**Why query parameters for search/filter/sort?**

- They are part of the URL, so the browser's back button and bookmarks work.
- They don't change the resource identity. `/resources?search=react` is still a list of resources, just filtered.
- They are idempotent: calling the same URL twice returns the same result (assuming no data changed).

**A beginner mistake:** Using `POST /resources/search` with a search body. This breaks REST, breaks caching, and makes URLs non-shareable.

### What FastAPI Receives

When you call `GET /api/resources?search=react&category=Frontend`, FastAPI's `list_resources` function receives:

- `search = "react"`
- `category = "Frontend"`

SQLAlchemy then builds:

```sql
SELECT * FROM resources
WHERE category ILIKE 'Frontend'
  AND (title ILIKE '%react%' OR description ILIKE '%react%' ...)
ORDER BY created_at DESC;
```

### Verify

```bash
curl "http://localhost:8000/api/resources?search=react&sort=title"
```

## Open `http://localhost:8000/docs` and try the query parameters in the interactive UI.

## React: Custom Hooks & When to Use Them

### Concept

A **custom hook** is a JavaScript function whose name starts with `use` and that may call other hooks. It lets you extract reusable stateful logic out of components.

### Why StudyShelf Needs Them

In Part 1, `HomePage` and `DetailPage` both had nearly identical fetch logic:

- `useState` for data, loading, error
- `useEffect` for the API call
- cleanup flags

This is duplicated. A custom hook extracts the pattern.

### When NOT to Use a Custom Hook

- If the logic is used in exactly one place and is unlikely to be reused, keep it inline.
- If the hook just wraps `useState` with no added behavior, it adds indirection without value.
- If the hook makes your component harder to read because you have to jump between files.

**Our rule:** Extract a hook when two or more components need the same pattern, or when the logic is complex enough to deserve its own test.

### Implementation

**CREATE FOLDER** `frontend/src/hooks`

**CREATE FILE** `frontend/src/hooks/useResources.js`:

```javascript
import { useState, useCallback } from "react";
import { fetchResources } from "../api";

/**
 * Hook for fetching and managing the resource list.
 *
 * Why useCallback for `load`?
 * `load` is used inside `useEffect` in the component. Without useCallback,
 * `load` would be a new function on every render, causing useEffect to
 * re-run constantly. useCallback with an empty dependency array makes it
 * stable.
 */
export function useResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchResources(params);
      setResources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { resources, loading, error, load, setResources };
}
```

**CREATE FILE** `frontend/src/hooks/useResource.js`:

```javascript
import { useState, useEffect } from "react";
import { fetchResourceById } from "../api";

/**
 * Hook for fetching a single resource by ID.
 *
 * We do NOT use useCallback here because `load` is not exposed
 * to the outside. It only runs inside this useEffect.
 */
export function useResource(id) {
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
        if (!cancelled) setResource(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { resource, loading, error, setResource };
}
```

**Understand the code:**

- `useResources` returns `setResources` so the component can optimistically update the list after creating a resource.
- `useCallback([], ...)` -- the empty dependency array is safe because `fetchResources` is an imported module function (stable), and `setLoading` / `setError` / `setResources` are guaranteed stable by React.
- `useResource` does not use `useCallback` because the fetch logic is self-contained inside `useEffect`.

**When NOT to use useCallback:** If the function is never passed to a child component or used in a dependency array, `useCallback` provides no benefit. It might even hurt performance by adding overhead.

---

## React: Derived State & Component Design

### Concept

**Derived state** is data you compute during rendering instead of storing in `useState`.

### Try It Yourself

You have a list of resources. You want to show a dropdown of unique categories. Should you:

A) Store categories in `useState` and update them whenever resources change?

B) Compute them from `resources` during render?

Think about which approach has fewer bugs and less code.

### Answer

**B is correct.** Categories are completely determined by `resources`. If you store them separately, you create two sources of truth and risk them getting out of sync.

```javascript
const categories = [...new Set(resources.map((r) => r.category))].sort();
```

This is calculated on every render. For 100 resources, this is instant. You do not need `useMemo` here.

**When to use `useMemo`:** Only when the calculation is genuinely expensive (sorting 10,000 items, complex object transformations) and you have measured a performance problem.

**A beginner mistake:** Putting `const [categories, setCategories] = useState([])` and a `useEffect` that recalculates whenever `resources` changes. This is more code, more bugs, and slower.

### Component Composition

In Part 1, `AddResourceForm` only created resources. We now also need to edit them.

**Design decision:** Create a single `ResourceForm` component that works for both create and edit.

**Why?** The inputs are identical. The only differences are:

- Initial values (empty vs. populated)
- Submit handler (POST vs. PATCH)
- Button label ("Add" vs. "Save")

**CREATE FILE** `frontend/src/components/ResourceForm.jsx`:

```jsx
import { useState, useEffect, useRef } from "react";

function ResourceForm({ initialData, onSubmit, submitLabel, onCancel }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [category, setCategory] = useState(initialData?.category || "");
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags?.join(", ") || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const titleRef = useRef(null);

  // Focus the title input when the form mounts
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Sync form when initialData changes (e.g., navigating between edits)
  useEffect(() => {
    setTitle(initialData?.title || "");
    setUrl(initialData?.url || "");
    setDescription(initialData?.description || "");
    setCategory(initialData?.category || "");
    setTagsInput(initialData?.tags?.join(", ") || "");
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      await onSubmit({
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
        category: category.trim() || "Uncategorized",
        tags,
      });
      if (!initialData) {
        // Reset only for create mode
        setTitle("");
        setUrl("");
        setDescription("");
        setCategory("");
        setTagsInput("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
      <h2>{initialData ? "Edit Resource" : "Add Resource"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "0.5rem" }}>
        <input
          ref={titleRef}
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

      <div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{ marginLeft: "0.5rem" }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ResourceForm;
```

**Understand the code:**

- `useRef` stores a reference to the DOM input. We use it to call `.focus()` after mount. This is a legitimate use of `useRef` -- interacting with a DOM node imperatively.
- The second `useEffect` syncs form fields when `initialData` changes. This is necessary because the edit page might navigate from editing resource 1 to resource 2 without unmounting the component.
- `onCancel` is optional. The form works for both create (no cancel) and edit (cancel returns to detail).

## **When NOT to use useEffect for syncing props to state:** If the prop never changes after mount, you do not need it. But for a reusable edit form where the `id` in the URL can change, we do need it.

## React: CRUD UI

### API Layer Update

**REPLACE FILE** `frontend/src/api.js`:

```javascript
const API_BASE = "http://localhost:8000/api";

async function handleResponse(response) {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `HTTP ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function fetchResources(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.sort) query.set("sort", params.sort);
  const qs = query.toString();
  const url = `${API_BASE}/resources${qs ? "?" + qs : ""}`;
  const res = await fetch(url);
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

export async function updateResource(id, updates) {
  const res = await fetch(`${API_BASE}/resources/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

export async function deleteResource(id) {
  const res = await fetch(`${API_BASE}/resources/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}
```

**Understand the code:**

- `URLSearchParams` builds the query string for search/filter/sort.
- `handleResponse` now returns `null` for 204 No Content (used by DELETE).

### FilterBar Component

**CREATE FILE** `frontend/src/components/FilterBar.jsx`:

```jsx
function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  categories,
}) {
  return (
    <div
      style={{
        marginBottom: "1rem",
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
      }}
    >
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ flex: 1, minWidth: "200px", padding: "0.5rem" }}
      />
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        style={{ padding: "0.5rem" }}
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        style={{ padding: "0.5rem" }}
      >
        <option value="">Newest First</option>
        <option value="title">Title A-Z</option>
        <option value="favorite">Favorites First</option>
      </select>
    </div>
  );
}

export default FilterBar;
```

### ResourceCard Update

**REPLACE FILE** `frontend/src/components/ResourceCard.jsx`:

```jsx
import { Link } from "react-router-dom";

function ResourceCard({ resource, onToggleFavorite }) {
  return (
    <div
      className="resource-card"
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        marginBottom: "1rem",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
        }}
      >
        <h3 style={{ margin: 0 }}>
          <Link to={`/resources/${resource.id}`}>{resource.title}</Link>
        </h3>
        <button
          onClick={() => onToggleFavorite(resource.id, !resource.favorite)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.2rem",
          }}
          aria-label={resource.favorite ? "Unfavorite" : "Favorite"}
        >
          {resource.favorite ? "⭐" : "☆"}
        </button>
      </div>
      <p>{resource.description || "No description"}</p>
      <div>
        <span
          style={{
            background: "#eee",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "0.85rem",
          }}
        >
          {resource.category}
        </span>
      </div>
      <div style={{ marginTop: "0.5rem" }}>
        {resource.tags.map((tag) => (
          <span
            key={tag}
            style={{
              marginRight: "6px",
              fontSize: "0.8rem",
              color: "#666",
            }}
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ResourceCard;
```

### ResourceList Update

**REPLACE FILE** `frontend/src/components/ResourceList.jsx`:

```jsx
import ResourceCard from "./ResourceCard";

function ResourceList({ resources, onToggleFavorite }) {
  if (resources.length === 0) {
    return <p>No resources found.</p>;
  }

  return (
    <div>
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

export default ResourceList;
```

### HomePage Update

**REPLACE FILE** `frontend/src/pages/HomePage.jsx`:

```jsx
import { useState, useEffect } from "react";
import { useResources } from "../hooks/useResources";
import { createResource, updateResource } from "../api";
import ResourceForm from "../components/ResourceForm";
import FilterBar from "../components/FilterBar";
import ResourceList from "../components/ResourceList";

function HomePage() {
  const { resources, loading, error, load } = useResources();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  // Derived state: unique categories from current resources
  const categories = [...new Set(resources.map((r) => r.category))].sort();

  // Fetch whenever filters change
  useEffect(() => {
    load({
      search: search || undefined,
      category: category || undefined,
      sort: sort || undefined,
    });
  }, [search, category, sort, load]);

  const handleCreate = async (data) => {
    await createResource({ ...data, favorite: false });
    await load({
      search: search || undefined,
      category: category || undefined,
      sort: sort || undefined,
    });
  };

  const handleToggleFavorite = async (id, favorite) => {
    await updateResource(id, { favorite });
    await load({
      search: search || undefined,
      category: category || undefined,
      sort: sort || undefined,
    });
  };

  return (
    <div>
      <h1>StudyShelf</h1>
      <ResourceForm onSubmit={handleCreate} submitLabel="Add Resource" />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        sort={sort}
        onSortChange={setSort}
        categories={categories}
      />
      {loading && <p>Loading resources...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && (
        <ResourceList
          resources={resources}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}

export default HomePage;
```

**Understand the code:**

- `categories` is derived state. No `useState`, no `useEffect`, no `useMemo`.
- `useEffect` with `[search, category, sort, load]` is the correct use of `useEffect`: it synchronizes UI state (filters) with server state.
- After creating or toggling a favorite, we call `load(...)` to refresh the list. This ensures the UI reflects the current filters.

**Common mistake:** Updating local state after a mutation instead of refetching. If you filter by "Frontend" and add a "Backend" resource, optimistic local updates would show it in the wrong filtered view. Refetching guarantees consistency.

### DetailPage Update

**REPLACE FILE** `frontend/src/pages/DetailPage.jsx`:

```jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useResource } from "../hooks/useResource";
import { updateResource, deleteResource } from "../api";
import ResourceDetail from "../components/ResourceDetail";

function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resource, loading, error, setResource } = useResource(id);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleFavorite = async () => {
    try {
      const updated = await updateResource(id, {
        favorite: !resource.favorite,
      });
      setResource(updated);
    } catch (err) {
      alert("Failed to update: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this resource?"))
      return;
    setIsDeleting(true);
    try {
      await deleteResource(id);
      navigate("/");
    } catch (err) {
      alert("Failed to delete: " + err.message);
      setIsDeleting(false);
    }
  };

  if (loading) return <p>Loading resource...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!resource) return <p>Resource not found.</p>;

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
        ← Back
      </button>
      <ResourceDetail resource={resource} />
      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <button onClick={handleToggleFavorite}>
          {resource.favorite ? "Unfavorite" : "Favorite"}
        </button>
        <button onClick={() => navigate(`/resources/${id}/edit`)}>Edit</button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          style={{ color: "red" }}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default DetailPage;
```

### EditPage

**CREATE FILE** `frontend/src/pages/EditPage.jsx`:

```jsx
import { useParams, useNavigate } from "react-router-dom";
import { useResource } from "../hooks/useResource";
import ResourceForm from "../components/ResourceForm";
import { updateResource } from "../api";

function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resource, loading, error } = useResource(id);

  const handleUpdate = async (data) => {
    await updateResource(id, data);
    navigate(`/resources/${id}`);
  };

  if (loading) return <p>Loading resource...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!resource) return <p>Resource not found.</p>;

  return (
    <div>
      <h1>Edit Resource</h1>
      <ResourceForm
        initialData={resource}
        onSubmit={handleUpdate}
        submitLabel="Save Changes"
        onCancel={() => navigate(`/resources/${id}`)}
      />
    </div>
  );
}

export default EditPage;
```

### App Update

**REPLACE FILE** `frontend/src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";
import EditPage from "./pages/EditPage";

function App() {
  return (
    <BrowserRouter>
      <nav
        style={{
          padding: "1rem",
          borderBottom: "1px solid #ddd",
          marginBottom: "1rem",
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          StudyShelf
        </Link>
      </nav>
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1rem" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/resources/:id" element={<DetailPage />} />
          <Route path="/resources/:id/edit" element={<EditPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
```

### Verify

```bash
cd frontend
npm run dev
```

Test the complete flow:

1. Add a resource
2. Search for it
3. Filter by category
4. Sort by title
5. Click to view details
6. Favorite it from both list and detail
7. Edit it
8. Delete it
9. Confirm it disappears from the list

## **Common mistake:** After deleting a resource, the list still shows it. This happens if `HomePage` was already mounted and does not refetch on navigation. In our code, navigating from DetailPage back to HomePage remounts HomePage, triggering `useEffect`. If you see stale data, check that your route navigation actually unmounts the previous page.

## The Full Request Lifecycle

Let's trace the complete lifecycle when a user clicks "Favorite" on a resource card.

### Step-by-Step Flow

```
1. USER clicks Favorite button on ResourceCard
   |
2. React: onClick calls handleToggleFavorite(id, true)
   |
3. React: handleToggleFavorite calls updateResource(id, {favorite: true})
   |
4. React: fetch() sends PATCH /api/resources/1
   with body: {"favorite": true}
   |
5. BROWSER adds CORS headers, sends HTTP over TCP to localhost:8000
   |
6. UVICORN receives the HTTP request, routes it to FastAPI
   |
7. FASTAPI: Depends(get_db) creates a new SQLAlchemy session
   |
8. FASTAPI: routes/resources.py calls resource_service.update_resource(db, 1, updates)
   |
9. SERVICE: get_resource(db, 1) runs SELECT * FROM resources WHERE id = 1
   |
10. SQLITE returns the row
    |
11. SERVICE: setattr(db_resource, "favorite", True)
    |
12. SERVICE: db.commit() -- SQLite writes the change to disk
    |
13. SERVICE: db.refresh(db_resource) -- reloads updated_at from DB
    |
14. SERVICE: returns the updated ResourceModel
    |
15. FASTAPI: converts ResourceModel to Pydantic Resource schema
    |
16. FASTAPI: serializes to JSON, sends HTTP 200 response
    |
17. BROWSER receives JSON, fetch() resolves
    |
18. React: handleResponse parses JSON
    |
19. React: DetailPage calls setResource(updated) (or HomePage calls load())
    |
20. React: state changes trigger re-render
    |
21. UI updates: star changes from ☆ to ⭐
```

**Key insight:** Every layer has a single job. If something breaks, you can identify the layer:

- UI broken? Check React state and JSX.
- No network request? Check the event handler and `api.js`.
- 404 response? Check the URL and route definition.
- 422 response? Check Pydantic validation.
- 500 response? Check FastAPI logs for a Python exception.
- Database error? Check SQLAlchemy query or SQLite file permissions.

---

## Debugging Full-Stack

### The Layered Approach

When something breaks, work from the UI inward:

**1. Browser Console (React layer)**

- Is there a JavaScript error? A typo in a component name?
- Is `resource` undefined because the fetch hasn't finished?

**2. Network Tab (HTTP layer)**

- Did the request actually fire?
- What is the URL? Is it `http://localhost:8000/api/resources` or did you forget the port?
- What is the status code?
  - `200` = success
  - `201` = created
  - `204` = deleted (no body)
  - `404` = not found
  - `422` = validation failed (check request body)
  - `500` = server crashed (check FastAPI terminal)
- What is the request body? Is the JSON valid?
- What is the response body?

**3. FastAPI Logs (Backend layer)**

- Look at the terminal where `uvicorn` is running.
- Do you see the request arriving?
- Is there a Python traceback?

**4. Database Layer**

- Open `studyshelf.db` with `sqlite3` or a GUI tool.
- Does the table exist? `SELECT * FROM resources;`
- Did the commit actually happen?

### Example Debugging Session

**Symptom:** Clicking "Add Resource" does nothing. No error in console.

**Debug:**

1. Open Network tab. No request shown.
2. Check the button's `onClick`. Is it wired to `handleSubmit`? Is `handleSubmit` calling `e.preventDefault()`? Yes? Then...
3. Add `console.log("submitting")` at the top of `handleSubmit`. Does it print? No?
4. The button is outside the `<form>` or missing `type="submit"`.

**Symptom:** Backend returns 500 Internal Server Error.

**Debug:**

1. Check the uvicorn terminal. You see a traceback.
2. It says `AttributeError: 'NoneType' object has no attribute 'title'`.
3. This means `get_resource` returned `None` and the route tried to access `.title` before checking.
4. Fix: Add the `if db_resource is None: raise HTTPException(404)` guard.

**Symptom:** Search returns all resources, ignoring the query.

**Debug:**

1. Check Network tab. Is the URL `.../resources?search=react`? Yes.
2. Check the backend route. Is `search` being passed to `get_resources`? Yes.
3. Check the service. Is the `ilike` pattern correct? Should be `%react%`.
4. Check the database. Are resources actually stored with titles? Yes.
5. Ah -- `ilike` might not work as expected with empty strings. Add a check: `if search:` before building the filter.

---

## Testing

### Why Test the Backend?

Frontend tests are fragile. Backend tests are fast and deterministic. If the API contract is solid, the frontend can trust it.

### Setup

```bash
cd backend
pip install pytest httpx
```

**CREATE FILE** `backend/test_resources.py`:

```python
from fastapi.testclient import TestClient
from database import engine, Base
from main import app

# Use a fresh in-memory database for tests
Base.metadata.create_all(bind=engine)

client = TestClient(app)


def test_list_empty():
    response = client.get("/api/resources")
    assert response.status_code == 200
    assert response.json() == []


def test_create_and_read():
    payload = {
        "title": "React Docs",
        "url": "https://react.dev",
        "category": "Frontend",
        "tags": ["react"],
    }
    create_res = client.post("/api/resources", json=payload)
    assert create_res.status_code == 201
    data = create_res.json()
    assert data["title"] == "React Docs"
    assert data["id"] == 1

    read_res = client.get("/api/resources/1")
    assert read_res.status_code == 200
    assert read_res.json()["url"] == "https://react.dev"


def test_update():
    res = client.patch("/api/resources/1", json={"favorite": True})
    assert res.status_code == 200
    assert res.json()["favorite"] is True


def test_delete():
    res = client.delete("/api/resources/1")
    assert res.status_code == 204

    get_res = client.get("/api/resources/1")
    assert get_res.status_code == 404


def test_read_invalid():
    res = client.get("/api/resources/999")
    assert res.status_code == 404


def test_search():
    client.post("/api/resources", json={
        "title": "Vue Guide",
        "url": "https://vuejs.org",
        "category": "Frontend",
        "tags": ["vue"],
    })
    res = client.get("/api/resources?search=vue")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["title"] == "Vue Guide"
```

**Understand the code:**

- `TestClient` simulates HTTP requests without running a real server.
- `Base.metadata.create_all(bind=engine)` ensures the test database has the tables.
- Each test is independent. In a real project, you would use a fresh database per test with `pytest` fixtures.

### Run Tests

```bash
cd backend
pytest test_resources.py -v
```

### Manual Testing

Always verify your API manually too:

1. **Swagger UI:** `http://localhost:8000/docs` -- click "Try it out" on each endpoint.
2. **curl:** See the verification steps in the Routes section above.
3. **Browser:** `http://localhost:8000/api/resources` for GET endpoints.

---

## PART 2 COMPLETE -- STOP HERE

Do not proceed to advanced features such as GitHub metadata lookup, authentication, or deployment.

---

## Verification Checklist

Before moving on, verify all of the following:

- [ ] `pip install sqlalchemy` in the backend virtual environment
- [ ] `backend/database.py` creates `studyshelf.db` on startup
- [ ] `backend/models.py` defines the SQLAlchemy table
- [ ] `backend/schemas.py` has `ResourceBase`, `ResourceCreate`, `ResourceUpdate`, `Resource`
- [ ] `backend/services/resources.py` has `get_resources`, `get_resource`, `create_resource`, `update_resource`, `delete_resource`
- [ ] `backend/routes/resources.py` has GET list, GET by ID, POST, PATCH, DELETE
- [ ] `backend/main.py` wires the router and creates tables
- [ ] Query parameters work: `?search=`, `?category=`, `?sort=`
- [ ] `backend/test_resources.py` passes with `pytest`
- [ ] Frontend `api.js` handles query params, PATCH, DELETE, and 204 responses
- [ ] `useResources` hook extracts list-fetching logic from HomePage
- [ ] `useResource` hook extracts single-resource fetching from DetailPage and EditPage
- [ ] `ResourceForm` is reused for both create and edit
- [ ] `FilterBar` allows search, category filter, and sort
- [ ] Categories dropdown is derived from resources, not stored in state
- [ ] Adding a resource refreshes the filtered list correctly
- [ ] Favoriting a resource updates the UI
- [ ] Editing a resource navigates to `/resources/:id/edit` and saves correctly
- [ ] Deleting a resource removes it and navigates home
- [ ] Loading, error, and empty states work on all pages
- [ ] `useRef` is used to focus the title input on form mount
- [ ] `useCallback` is used to stabilize the `load` function in `useResources`
- [ ] No `useMemo` is used where simple derived state suffices
- [ ] No `useEffect` is used where simple event handlers suffice

---

## Concepts You Should Now Understand

### Backend Architecture

- [ ] The difference between a database model, a Pydantic request schema, and a Pydantic response schema
- [ ] Why routes should be thin and business logic should live in services
- [ ] How FastAPI dependency injection provides a database session per request
- [ ] Why `db.commit()` is required to persist changes
- [ ] How SQLAlchemy translates Python method calls into SQL
- [ ] Why query parameters are appropriate for filtering/searching/sorting
- [ ] The difference between `GET`, `POST`, `PATCH`, and `DELETE`
- [ ] Why `PATCH` uses `exclude_unset=True` for partial updates
- [ ] How `APIRouter` organizes routes with prefixes

### React Architecture

- [ ] When to extract a custom hook (reused logic, complex state)
- [ ] When NOT to extract a custom hook (single-use, trivial logic)
- [ ] How `useCallback` stabilizes functions for `useEffect` dependency arrays
- [ ] When `useCallback` is unnecessary (function not used in deps or passed to children)
- [ ] How `useRef` accesses DOM nodes imperatively
- [ ] When `useMemo` is justified (expensive computation) vs. unnecessary (simple filtering)
- [ ] How to compute derived state during render instead of storing it
- [ ] How component composition reduces duplication (reusable ResourceForm)
- [ ] Where to place state (as low as possible, as high as necessary)
- [ ] Why to refetch after mutations instead of optimistic local updates when filters are involved

### Async & Effects

- [ ] The complete request lifecycle from click to database to UI update
- [ ] Why `useEffect` is correct for syncing filters to server state
- [ ] Why `useEffect` is incorrect for simple event-driven updates
- [ ] How cleanup flags prevent state updates on unmounted components
- [ ] How to handle loading, error, success, and empty states consistently

### Debugging

- [ ] How to trace a bug from browser console → Network tab → FastAPI logs → database
- [ ] What each HTTP status code means in the context of CRUD
- [ ] How to use Swagger UI and curl for manual API testing
- [ ] How to write basic pytest tests for FastAPI endpoints

### Engineering Decisions

- [ ] Why separating API calls into `api.js` is better than inline fetch
- [ ] Why form validation belongs on both client (UX) and server (security)
- [ ] Why we don't overengineer a small project (no Redux, no complex state management)
- [ ] When to lift state vs. when to keep it local

---

_End of Part 2. Part 3 will add advanced features such as GitHub metadata lookup, pagination, and deployment considerations._
