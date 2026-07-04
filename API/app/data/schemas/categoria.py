from pydantic import BaseModel

class CategoriaBase(BaseModel):
    name: str

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaResponse(CategoriaBase):
    id: int
    class Config:
        from_attributes = True
