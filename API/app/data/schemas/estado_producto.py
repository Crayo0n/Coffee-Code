from pydantic import BaseModel

class EstadoProductoBase(BaseModel):
    name: str

class EstadoProductoResponse(EstadoProductoBase):
    id: int
    class Config:
        from_attributes = True
