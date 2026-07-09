from pydantic import BaseModel
from typing import Optional

class MesaBase(BaseModel):
    number: int
    status: Optional[str] = "available"

class MesaCreate(MesaBase):
    pass

class MesaUpdateStatus(BaseModel):
    status: str

class MesaResponse(MesaBase):
    id: int
    class Config:
        from_attributes = True
