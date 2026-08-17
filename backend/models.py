from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from database import Base

class ResourceModel(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    description = Column(String, default="")
    category = Column(String, default="uncategorized")
    tags = Column(String, default="")
    favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())