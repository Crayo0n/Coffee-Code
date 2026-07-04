from pydantic import BaseModel
from typing import Optional
from .producto import ProductoResponse

class DetallePedidoBase(BaseModel):
    product_id: int
    quantity: int

class DetallePedidoCreate(DetallePedidoBase):
    pass

class DetallePedidoResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    producto: Optional[ProductoResponse] = None
    class Config:
        from_attributes = True
