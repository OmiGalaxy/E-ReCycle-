from pydantic import BaseModel
from typing import Optional

class ClassificationCreate(BaseModel):
    item_name: str
    description: str
    condition: str
    category: str

class ClassificationResponse(BaseModel):
    id: int
    user_id: int
    item_name: str
    description: str
    condition: str
    image_path: Optional[str] = None
    category: str
    created_at: str
    
    class Config:
        from_attributes = True