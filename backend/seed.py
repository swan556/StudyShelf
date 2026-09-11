import os
from database import SessionLocal, engine, Base
from models import ResourceModel

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Clear existing to prevent duplicates on multiple runs
    db.query(ResourceModel).delete()
    db.commit()

    resources = [
        {
            "title": "React Official Documentation",
            "url": "https://react.dev/",
            "description": "The official documentation for React, a library for web and native user interfaces.",
            "category": "Frontend",
            "tags": "react, javascript, library",
            "favorite": True
        },
        {
            "title": "FastAPI Framework",
            "url": "https://fastapi.tiangolo.com/",
            "description": "FastAPI is a modern, fast (high-performance), web framework for building APIs with Python 3.8+ based on standard Python type hints.",
            "category": "Backend",
            "tags": "python, api, framework, fast",
            "favorite": True
        },
        {
            "title": "React Repository",
            "url": "https://github.com/facebook/react",
            "description": "The React GitHub repository. Useful for tracking issues, releases, and source code.",
            "category": "GitHub",
            "tags": "react, javascript, open-source",
            "favorite": False
        },
        {
            "title": "FastAPI Repository",
            "url": "https://github.com/fastapi/fastapi",
            "description": "The FastAPI GitHub repository.",
            "category": "GitHub",
            "tags": "python, open-source, backend",
            "favorite": True
        },
        {
            "title": "Vite",
            "url": "https://vitejs.dev/",
            "description": "Next Generation Frontend Tooling. Get ready for a development environment that can finally catch up with you.",
            "category": "Tooling",
            "tags": "frontend, build-tool, vite, react",
            "favorite": False
        },
        {
            "title": "Tailwind CSS",
            "url": "https://tailwindcss.com/",
            "description": "Rapidly build modern websites without ever leaving your HTML.",
            "category": "CSS",
            "tags": "css, framework, design",
            "favorite": False
        },
        {
            "title": "SQLite Documentation",
            "url": "https://www.sqlite.org/docs.html",
            "description": "Official documentation for SQLite, a C-language library that implements a small, fast, self-contained, high-reliability, full-featured, SQL database engine.",
            "category": "Database",
            "tags": "sql, database, sqlite",
            "favorite": False
        }
    ]

    for item in resources:
        db_resource = ResourceModel(
            title=item["title"],
            url=item["url"],
            description=item["description"],
            category=item["category"],
            tags=item["tags"],
            favorite=item["favorite"]
        )
        db.add(db_resource)
    
    db.commit()
    print(f"Seeded {len(resources)} resources successfully!")
    db.close()

if __name__ == "__main__":
    seed_db()
