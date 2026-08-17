from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from schemas import Resource, ResourceCreate, ResourceUpdate
from services import resources as resource_service

router = APIRouter(prefix="/api/resources", tags=["resources"])

@router.get("", response_model=List[Resource])
def list_resources(
    search: Optional[str] = Query(None, description="search in title, description, category or tags"),
    category: Optional[str] = Query(None, description="filter by exact category"),
    sort: Optional[str] = Query(None, description="sort by: created_at, title, favorite"),
    db: Session = Depends(get_db)
):
    return resource_service.get_resources(db, search=search, category=category, sort=sort)

@router.get("/{resource_id}", response_model=Resource)
def read_resource(resource_id: int, db: Session = Depends(get_db)):
    db_resource = resource_service.get_resource(db, resource_id)
    if db_resource is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    return db_resource

@router.post("", response_model=Resource, status_code=status.HTTP_201_CREATED)
def create_resource(resource: ResourceCreate, db: Session = Depends(get_db)):
    return resource_service.create_resource(db, resource)

@router.put("/{resource_id}", response_model=Resource)
def update_resource(resource_id: int, updates: ResourceUpdate, db: Session = Depends(get_db)):
    db_resource = resource_service.update_resource(db, resource_id, updates)
    if db_resource is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    return db_resource

@router.delete("/{resource_id}", response_model=Resource)
def delete_resource(resource_id: int, db:Session = Depends(get_db)):
    db_resource = resource_service.delete_resource(db, resource_id)
    if db_resource is None:
        HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    return None