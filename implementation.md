# Task: Create a Complete StudyShelf Project + Learning Guide

I want you to create a single Markdown file called:

`STUDYSHELF_GUIDE.md`

This file must teach me and guide me through building a complete small full-stack project called **StudyShelf**, from absolute project initialization to a finished, working application.

This is NOT supposed to be a generic tutorial.

It is supposed to function as a **hands-on learning + implementation guide**, where I learn the concepts exactly when I need them and then immediately use them in the project.

---

# 1. My current skill level

You must design the guide around the following exact skill level.

## React

I have previously used React.

I know the syntax and can write React code.

However, I do NOT have strong confidence in my ability to architect a React application properly.

For example:

- I can write components.
- I know basic hooks.
- I can make API calls.
- I can write JavaScript.
- I can probably make something that works.

But I am not confident about:

- whether my component structure is good
- where state should live
- when `useEffect` should be used
- when it should NOT be used
- how to handle async operations properly
- how to structure API calls
- how to handle loading/error/empty states
- how to avoid unnecessary re-renders
- when `useMemo` makes sense
- when `useCallback` makes sense
- when `useRef` makes sense
- how to create reusable components
- how to create reusable hooks
- how to organize a real React project
- how to write production-quality React rather than code that merely works

Therefore:

**Use this project to thoroughly brush up my practical React knowledge.**

Do not assume that knowing React syntax means I understand React engineering.

Whenever an important React concept appears, explain:

1. What it is.
2. Why it exists.
3. When it should be used.
4. When it should NOT be used.
5. What problem it solves.
6. How it applies to StudyShelf.
7. Then make me implement it.

Do NOT dump a giant React tutorial before the project starts.

Teach concepts just before they become necessary.

---

# 2. FastAPI skill level

I have used FastAPI before.

I can write basic FastAPI code.

But I do NOT feel that I properly understand how to build a good FastAPI backend from scratch.

Assume I know very little beyond basic syntax.

I want this project to teach me FastAPI properly.

Explain concepts such as:

- routes
- HTTP methods
- path parameters
- query parameters
- request bodies
- Pydantic models
- response models
- status codes
- HTTP exceptions
- dependency injection
- database interaction
- async endpoints
- `async` / `await`
- service-layer architecture
- API structure
- validation
- error handling
- CORS
- project organization
- configuration
- environment variables
- API/client separation

Do not simply give me code and say "this is how FastAPI works."

Explain WHY the code is structured that way.

I want to understand the backend rather than memorize FastAPI syntax.

---

# 3. Database knowledge

I know DBMS theory reasonably well.

I understand concepts such as:

- tables
- primary keys
- foreign keys
- normalization
- relationships
- CRUD
- indexes
- transactions

Do not waste huge amounts of time teaching basic DBMS theory.

However, I want to learn how those concepts translate into an actual application.

Use **SQLite** for this project.

I want to learn:

- schema design
- practical SQL
- database models
- migrations if appropriate
- querying from FastAPI
- relationships
- constraints
- indexes where appropriate

Use an ORM if you think it is appropriate, but explain what the ORM is actually doing.

Do not hide SQL/database concepts behind an ORM abstraction.

---

# 4. Computer networking knowledge

I know almost nothing about Computer Networks.

Do NOT assume I understand:

- IP addresses
- ports
- TCP
- HTTP
- client/server communication
- LAN
- DNS
- CORS
- request/response lifecycle

Teach only the networking concepts that are actually necessary for this project.

Do not turn the guide into a complete Computer Networks course.

Whenever we use a networking concept, explain it clearly enough that I understand what is physically/logically happening.

For example, when React calls:

`GET /api/resources`

I should understand:

```text
Browser
   ↓
HTTP request
   ↓
FastAPI server
   ↓
database
   ↓
HTTP response
   ↓
React
```

and understand what each step means.

---

# 5. General coding quality

This is extremely important.

I do not want to merely finish the project.

I want to learn how to tell whether the code I write is good.

Throughout the guide, continuously teach:

- separation of concerns
- single responsibility
- reasonable abstractions
- naming
- error handling
- validation
- reusable components
- avoiding duplicated code
- project structure
- maintainability
- debugging
- logging
- configuration
- security
- testing
- readable code
- avoiding overengineering

Whenever you introduce an architectural decision, explain:

> "We are doing this because..."

and also, where useful:

> "A beginner might be tempted to do X, but we are doing Y because..."

Do NOT blindly enforce enterprise architecture.

This is a small one-night project.

The architecture should be **simple but genuinely good**.

Avoid unnecessary:

- microservices
- Redux
- Docker
- Redis
- Kafka
- Kubernetes
- complicated authentication
- excessive abstractions
- elaborate design patterns
- unnecessary libraries

The goal is to learn good engineering, not to maximize the number of technologies.

---

# 6. The project: StudyShelf

StudyShelf is a personal resource/bookmark manager.

The application allows me to save useful learning resources.

Examples:

- React documentation
- FastAPI documentation
- CSES
- Codeforces problems
- GitHub repositories
- YouTube tutorials
- articles
- documentation
- project references

The application should allow me to:

1. Add a resource.
2. View all resources.
3. Search resources.
4. Filter resources by category.
5. Sort resources.
6. Open a resource.
7. View details.
8. Edit a resource.
9. Delete a resource.
10. Mark resources as favorites.
11. Have useful loading/error/empty states.

The application should feel like a small real product rather than a Todo tutorial.

---

# 7. Recommended data model

Use a resource model similar to:

```text
Resource

id
title
url
description
category
tags
favorite
created_at
updated_at
```

You may modify this if you have a genuinely better design, but keep it simple.

Possible categories:

```text
DSA
React
Backend
FastAPI
Computer Networks
Database
System Design
Other
```

Tags can be represented simply.

Do NOT turn this into a complex tagging system.

---

# 8. External public API

Use at least one useful external public API.

Prefer the GitHub API because it fits the project well.

For example, allow the user to enter a GitHub repository URL such as:

```text
https://github.com/facebook/react
```

and optionally have StudyShelf fetch useful metadata:

- repository name
- description
- stars
- forks
- language
- GitHub URL

The flow should be:

```text
React
   ↓
FastAPI
   ↓
GitHub API
   ↓
FastAPI
   ↓
React
```

Do NOT call the external API directly from React if using the backend as the intended architectural boundary.

Explain why the backend can act as a controlled intermediary.

Keep this feature small enough that the project remains completable in one night.

If the GitHub API introduces unnecessary authentication/rate-limit complexity, use its public unauthenticated endpoints and clearly explain the limitations.

---

# 9. Required architecture

Use approximately:

```text
StudyShelf/
│
├── frontend/
│   ├── ...
│
└── backend/
    ├── ...
```

Frontend:

- React
- JavaScript or TypeScript
- React Router
- Fetch API or Axios

Backend:

- Python
- FastAPI
- Uvicorn
- SQLite
- SQLAlchemy or another sensible lightweight ORM
- Pydantic

Do not introduce unnecessary technologies.

---

# 10. The React concepts I specifically want covered

The project must deliberately exercise the following.

## Core

- components
- props
- state
- conditional rendering
- list rendering
- keys
- event handling
- forms
- controlled inputs

## Hooks

Teach and use where genuinely appropriate:

- `useState`
- `useEffect`
- `useRef`
- `useMemo`
- `useCallback`

Also teach:

- custom hooks

For every hook, explain why we are using it.

Especially explain the difference between:

```text
state
ref
derived value
side effect
memoized value
memoized callback
```

Do NOT artificially insert hooks just to say that we used them.

If a hook does not actually make sense for a particular part of the application, explicitly say so.

For example:

> "We could use useMemo here, but that would be unnecessary because..."

This is important because I want to learn **good React**, not hook cargo culting.

---

# 11. React async behavior

This must be a major part of the project.

Teach:

```javascript
async/await
fetch()
try/catch
```

and the lifecycle of an API request:

```text
idle
 ↓
loading
 ↓
success
```

or:

```text
idle
 ↓
loading
 ↓
error
```

Implement proper UI states:

```text
Loading...
Something went wrong.
No resources found.
Resources loaded.
```

Also teach how to avoid common mistakes with `useEffect` and async functions.

Explain dependency arrays properly.

Explain race conditions or stale requests at a basic practical level if relevant.

---

# 12. React application architecture

Teach me how to decide component boundaries.

For example, something like:

```text
App
├── Navbar
├── SearchBar
├── FilterBar
├── ResourceList
│   └── ResourceCard
├── ResourceForm
└── ResourceDetails
```

But do not blindly force this exact structure.

Explain why a component should or should not exist.

Teach:

- component responsibilities
- prop passing
- lifting state
- derived state
- reusable components
- custom hooks
- API abstraction

---

# 13. Routing

Use React Router.

The application should have routes such as:

```text
/
 /resources
 /resources/:id
 /add
 /edit/:id
```

Teach:

- routes
- navigation
- `Link`
- `useNavigate`
- route parameters
- reading URL state where useful

Explain why client-side routing exists.

---

# 14. REST API

Design a proper REST API.

Something approximately like:

```text
GET    /api/resources
GET    /api/resources/{id}
POST   /api/resources
PATCH  /api/resources/{id}
DELETE /api/resources/{id}

POST   /api/github/analyze
```

You may adjust this.

Teach:

- what REST means
- HTTP methods
- path parameters
- query parameters
- request bodies
- response bodies
- status codes
- errors

For search/filtering, prefer query parameters where appropriate:

```text
GET /api/resources?search=react&category=React
```

Explain why this is preferable to creating dozens of special endpoints.

---

# 15. FastAPI architecture

Do not put everything in `main.py`.

Teach a small but sensible structure, for example:

```text
backend/
├── main.py
├── database.py
├── models.py
├── schemas.py
├── routes/
│   ├── resources.py
│   └── github.py
└── services/
    └── github.py
```

You may improve this structure.

But every folder/file must have a reason.

Explain:

- what belongs in routes
- what belongs in services
- what belongs in models
- what belongs in schemas
- what belongs in database setup

Do not create files merely for architectural aesthetics.

---

# 16. Pydantic

Teach Pydantic through the actual project.

For example:

```python
class ResourceCreate(BaseModel):
    title: str
    url: str
    description: str | None = None
    category: str
```

Explain:

- validation
- request schemas
- response schemas
- why request and response models may differ
- why we shouldn't blindly expose database models

---

# 17. Database layer

Use SQLite.

Teach:

```text
React
 ↓
FastAPI route
 ↓
service
 ↓
database
```

Explain the actual flow.

Teach:

- creating tables
- inserting
- selecting
- updating
- deleting
- filtering
- ordering
- relationships if needed

Keep the database schema small.

---

# 18. External API layer

For GitHub:

```text
React
 ↓
POST /api/github/analyze
 ↓
FastAPI
 ↓
GitHub API
 ↓
FastAPI
 ↓
React
```

Teach:

- making HTTP requests from FastAPI
- `httpx`
- async external requests
- timeouts
- errors
- validating external data
- not trusting external APIs blindly

---

# 19. CORS

Because frontend and backend may run on different ports, deliberately introduce the CORS problem.

For example:

```text
React
localhost:5173

FastAPI
localhost:8000
```

Explain why the browser cares about origins.

Then configure CORS properly for local development.

Do not simply tell me to copy a CORS configuration without explaining what it does.

---

# 20. Security

Include basic practical security.

At minimum:

- validate URLs
- validate request data
- avoid trusting client input
- don't expose unnecessary database fields
- handle invalid IDs
- handle missing resources
- don't leak internal exception details
- don't hardcode secrets
- explain why GitHub API keys should not be placed in React

Do not turn this into a security course.

---

# 21. Testing

Include a small amount of testing.

I want to learn what testing a backend actually looks like.

Test at least:

```text
GET resources
GET one resource
POST resource
PATCH resource
DELETE resource
invalid resource ID
invalid request
```

Also explain how I can manually test APIs using:

- browser
- curl
- FastAPI Swagger docs

Do not require an enormous test suite.

---

# 22. Debugging

This is important.

Whenever something can realistically go wrong, explain how I would debug it.

For example:

```text
React shows nothing
        ↓
Check browser console
        ↓
Check Network tab
        ↓
Check request URL
        ↓
Check status code
        ↓
Check FastAPI logs
        ↓
Check database
```

Teach me to debug the **whole request path**, not just React.

---

# 23. Production-quality mindset

Throughout the guide, compare:

```text
"It works"
```

versus:

```text
"It is reasonably well engineered."
```

Point out common beginner mistakes.

Examples:

- putting API calls everywhere
- massive components
- duplicated fetch logic
- unnecessary `useEffect`
- using state for derived data
- overusing `useMemo`
- overusing `useCallback`
- swallowing errors
- returning inconsistent API responses
- putting business logic inside routes
- blindly trusting user input
- hardcoding configuration
- poor naming
- mixing database logic with HTTP logic

But don't criticize code abstractly.

Tie each lesson to actual StudyShelf code.

---

# 24. The guide MUST be divided into exactly 3 major parts

This is extremely important.

I want to build the project in **three separate sessions**, with a break after Part 1 and another break after Part 2.

The three parts should feel like natural milestones.

---

# PART 1 — Foundation + React + Basic FastAPI

Goal:

Get a working frontend/backend application communicating with each other.

Cover:

### Learning

- project architecture
- HTTP fundamentals
- client/server model
- React project structure
- components
- props
- state
- forms
- controlled inputs
- `useEffect`
- async/await
- fetch
- loading/error states
- FastAPI basics
- routes
- request/response
- Pydantic
- CORS
- REST basics

### Implementation

Build:

```text
StudyShelf
    ↓
React frontend
    ↓
FastAPI backend
```

Start with a simple in-memory resource list if necessary.

Implement:

- resource listing
- resource cards
- search UI
- add-resource form
- API communication
- loading/error states
- basic routing

At the end of Part 1, the application should already run.

### Break point

Explicitly tell me:

```text
PART 1 COMPLETE

STOP HERE.

At this point you should have:
...
```

Then give me a short checklist of things I should personally verify before taking the break.

Do NOT start Part 2.

---

# PART 2 — Database + Proper CRUD + React Architecture

Goal:

Turn the prototype into a real full-stack application.

Cover:

### Backend

- SQLite
- SQLAlchemy
- models
- schemas
- CRUD
- service layer
- dependency injection
- error handling
- status codes
- database sessions
- query parameters
- filtering
- sorting

### React

Deepen:

- component architecture
- custom hooks
- `useRef`
- `useMemo`
- `useCallback`
- derived state
- lifting state
- reusable components
- API abstraction
- routing
- dynamic routes
- edit/delete
- optimistic or carefully managed UI updates where appropriate

Implement:

```text
GET /resources
GET /resources/{id}
POST /resources
PATCH /resources/{id}
DELETE /resources/{id}
```

Add:

- search
- category filtering
- sorting
- favorites
- resource details
- edit page
- delete functionality

The project should now feel like a legitimate application.

### Break point

Explicitly tell me:

```text
PART 2 COMPLETE

STOP HERE.

At this point you should have:
...
```

Give me a verification checklist.

Do NOT start Part 3.

---

# PART 3 — External API + Quality + Testing + Final Polish

Goal:

Finish the application and teach the concepts that make it feel professionally built.

Cover:

### External API

- FastAPI calling GitHub
- `httpx`
- async external requests
- timeouts
- error handling
- transforming external data
- frontend integration

### Quality

- better error handling
- loading states
- empty states
- reusable components
- custom hooks
- proper API layer
- configuration
- environment variables
- logging
- validation
- security
- URL validation
- CORS
- avoiding unnecessary rerenders
- reasonable memoization

### Testing

Test backend endpoints.

Teach:

- Swagger
- curl
- automated API tests
- basic frontend testing concepts if time permits

### Final application

The finished StudyShelf should allow:

```text
Add resource
      ↓
Store in SQLite
      ↓
Display in React
      ↓
Search
      ↓
Filter
      ↓
Sort
      ↓
Favorite
      ↓
Open details
      ↓
Edit
      ↓
Delete
```

And:

```text
GitHub URL
      ↓
FastAPI
      ↓
GitHub API
      ↓
Metadata
      ↓
StudyShelf
```

At the end, include:

- final architecture explanation
- final folder structure
- request lifecycle examples
- "what happens when I add a resource?"
- "what happens when I search?"
- "what happens when I open a resource?"
- "what happens when GitHub metadata is fetched?"
- explanation of how React, FastAPI, HTTP, and SQLite interact
- what I learned
- what parts directly transfer to ezShare
- what I should learn next before starting ezShare

---

# 25. Teaching style

This is perhaps the most important instruction.

Do NOT write this as:

> "Here is the final code. Copy this."

Instead, make it a **guided implementation**.

For every significant feature:

```text
## Concept

Explain the concept.

## Why StudyShelf needs it

Explain the actual problem.

## Design

Explain what we're going to build.

## Implementation

Give me the code.

## Understand the code

Walk through the important parts.

## Verify

Give me commands/actions to test it.

## Common mistakes

Tell me what could go wrong.

## What you should now understand

Summarize the concept.
```

Do not explain every trivial line of code.

Explain the lines that teach something.

---

# 26. Force me to think

Do not make the guide completely passive.

Occasionally give me small tasks such as:

> Before looking at the solution, try to decide where this state should live.

or:

> Try writing the Pydantic schema yourself first.

or:

> What HTTP status code should this endpoint return if the resource doesn't exist?

Then reveal the answer after a separator.

Use this sparingly.

The purpose is to make me reason about architecture rather than blindly follow instructions.

---

# 27. No unexplained code

Never introduce a library, function, decorator, hook, or architectural pattern without at least briefly explaining what it does and why we're using it.

For example, don't suddenly write:

```python
Depends(get_db)
```

and move on.

Explain:

- what `Depends` is
- why FastAPI has dependency injection
- why it's useful here
- what happens when the endpoint executes

Similarly, don't use:

```javascript
useMemo(...)
```

without explaining why.

---

# 28. Don't overteach irrelevant material

The guide should be comprehensive **for this project**, not comprehensive about software engineering in general.

Do not spend pages on:

- advanced SQL
- advanced networking
- advanced React internals
- advanced Python
- distributed systems
- cloud deployment
- Kubernetes
- authentication systems
- advanced DevOps

If a concept isn't needed for StudyShelf, leave it out or mention it briefly as something for later.

---

# 29. Code quality requirements

All code in the guide should be:

- complete
- runnable
- internally consistent
- compatible across files
- reasonably production-grade
- simple enough for a beginner to understand

Do not provide pseudo-code where actual implementation is required.

When changing a file, clearly say whether I should:

- create the file
- replace the entire file
- modify a specific section

Avoid giving snippets that cannot be integrated.

Make sure imports match the project structure.

Do not introduce one architecture early and silently change it later.

---

# 30. Final requirement

At the very beginning of the Markdown file, provide:

## What we are building

A concise description of StudyShelf.

Then:

## Final architecture

A concise preview of what the completed system will look like.

Then:

## How to use this guide

Explain that it is intentionally split into:

```text
Part 1 → Break
Part 2 → Break
Part 3 → Finished project
```

Tell me not to skip ahead.

The entire Markdown file should then contain the complete project guide.

---

# The final goal

By the time I finish the three parts, I should not merely have a StudyShelf application.

I should have a significantly better mental model of:

```text
React
   ↕
HTTP
   ↕
REST API
   ↕
FastAPI
   ↕
Service layer
   ↕
Database
```

and:

```text
Browser
   ↓
HTTP request
   ↓
FastAPI
   ↓
Database / External API
   ↓
FastAPI
   ↓
HTTP response
   ↓
React state
   ↓
UI
```

I should understand why the code is structured the way it is.

Most importantly, the knowledge should transfer directly to my next project, **ezShare**, where I will eventually work with:

```text
React
FastAPI
filesystem
filesystem events
database metadata
HTTP
LAN networking
file streaming
authentication
security
```

The StudyShelf guide should therefore deliberately teach the concepts that will later make ezShare easier.

Create the complete `STUDYSHELF_GUIDE.md` now.
