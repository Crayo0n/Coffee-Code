from pydantic import BaseModel
from datetime import datetime

class AlertaBase(BaseModel):
    message: str

class AlertaCreate(AlertaBase):
    pass

class AlertaResponse(AlertaBase):
    id: int
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True
