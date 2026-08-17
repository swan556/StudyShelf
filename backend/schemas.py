from pydantic import BaseModel, HttpUrl, Field, field_validator
from typing import List, Optional
from datetime import datetime

class ResourceBase(BaseModel):
    title: str = Field(..., min_length=1)
    url: HttpUrl
    description: str = ""
    category: str = ""
    tags: List[str] = []
    favorite: bool = False

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(BaseModel):
    # all fields are optional
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

    @field_validator("tags", mode="before")
    @classmethod
    def convert_tags_to_list(cls, v):
        if isinstance(v, str):
            if not v:
                return []
            return [t.strip() for t in v.split(",") if t.strip()]
        return v