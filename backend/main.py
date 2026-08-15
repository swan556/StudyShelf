from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors  import CORSMiddleware
from typing import List
from datetime import datetime
from models import Resource, ResourceCreate

app = FastAPI(title='StudyShelf API')

# cors allow react frontend to talk to this api, even though its bydefault not allowed to talk to stuff on same network
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"], # allows get, post, put, delete etc
    allow_headers=["*"] # allow any headers
)

_resources: List[Resource] = []
_next_id: int = 1

def _now() -> datetime:
    return datetime.utcnow()

# routes

@app.get("/api/resources", response_model=List[Resource])
def list_resources() -> List[Resource]:
    # get api resources, basically returns all resources
    return _resources

@app.get("/api/resources/{resource_id}", response_model=Resource)
def get_resource(resource_id: int) -> Resource:
    # gets one resource
    for r in _resources:
        if(r.id == resource_id):
            return r
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

@app.post("/api/resources", response_model=Resource, status_code=status.HTTP_201_CREATED)
def create_resource(data: ResourceCreate) -> Resource:
    global _next_id
    new_resource = Resource(
        id = _next_id,
        title = data.title,
        url = data.url,
        description = data.description,
        category = data.category,
        tags = data.tags,
        favourite = data.favourite,
        created_at = _now(),
        updated_at = _now()
    )
    _resources.append(new_resource)
    _next_id += 1
    return new_resource

