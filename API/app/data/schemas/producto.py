from pydantic import BaseModel
from decimal import Decimal
from typing import Optional
from .categoria import CategoriaResponse
from .estado_producto import EstadoProductoResponse

class ProductoBase(BaseModel):
    name: str
    price: Decimal
    category_id: int
    status_id: int
    stock: int = 50
    photo: Optional[str] = None
    description: Optional[str] = None

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[Decimal] = None
    category_id: Optional[int] = None
    status_id: Optional[int] = None
    stock: Optional[int] = None
    photo: Optional[str] = None
    description: Optional[str] = None

class ProductoResponse(ProductoBase):
    id: int
    categoria: Optional[CategoriaResponse] = None
    estado: Optional[EstadoProductoResponse] = None
    class Config:
        from_attributes = True
