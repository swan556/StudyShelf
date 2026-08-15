from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime

class ResourceBase(BaseModel):
    # overall base model, that field that is shared between creating and reading resources
    title: str
    url: HttpUrl
    description: str = ""
    category: str = "Uncategorized"
    tags: List[str] = []
    favourite: bool = False

class ResourceCreate(ResourceBase):
    # this is what client sends when creating a resource
    pass

class Resource(ResourceBase):
    # what the server sends back to client, also includes the generated fields
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True