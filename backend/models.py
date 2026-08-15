from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datatime import datetime

class ResourceBase(BaseModel):
    # overall base model, that field that is shared between creating and reading resources
    title: str
    url: HttpUrl
    description: str = ""
    category: str = "Uncategorized"
    tags = List[str] = []
    favourite: bool = false

class ResourceCreate(ResourceBase):
    # this is what client craetes 