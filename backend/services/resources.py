from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import ResourceModel
from schemas import ResourceCreate, ResourceUpdate
from utils import _tags_to_str, _str_to_tags


def get_resources(
        db: Session,
        search: Optional[str] = None,
        category: Optional[str] = None,
        sort: Optional[str] = None
) -> List[ResourceModel]:

    query = db.query(ResourceModel)

    if category:
        query = query.filter(ResourceModel.category.ilike(category))

    if search:
        pattern = f"%{search}%"
        search_filter = or_(
            ResourceModel.title.ilike(pattern),
            ResourceModel.description.ilike(pattern),
            ResourceModel.tags.ilike(pattern),
            ResourceModel.category.ilike(pattern)
        )
        query = query.filter(search_filter)

    if sort == "title":
        query = query.order_by(ResourceModel.title.asc())
    elif sort == "favorite":
        query = query.order_by(
            ResourceModel.favorite.desc(),
            ResourceModel.created_at.desc()
        )
    else:
        query = query.order_by(ResourceModel.created_at.desc())

    return query.all()

def get_resource(
        db: Session,
        resource_id: int
) -> Optional[ResourceModel]:

    return db.query(ResourceModel).filter(
        ResourceModel.id == resource_id
    ).first()

def create_resource(db: Session, resource: ResourceCreate) -> ResourceModel:
    db_resource = ResourceModel(
        title=resource.title,
        url=str(resource.url),
        description=resource.description,
        category=resource.category,
        tags=_tags_to_str(resource.tags),
        favorite=resource.favorite
    )
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

def update_resource(db: Session, resource_id: int, updates: ResourceUpdate) -> Optional[ResourceModel]:
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