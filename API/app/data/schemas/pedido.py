from pydantic import BaseModel
from typing import List, Optional
from .mesa import MesaResponse
from .colaborador import ColaboradorResponse
from .detalle_pedido import DetallePedidoCreate, DetallePedidoResponse

class PedidoBase(BaseModel):
    table_id: int
    notes: Optional[str] = None

class PedidoCreate(PedidoBase):
    detalles: List[DetallePedidoCreate]

class PedidoUpdateStatus(BaseModel):
    status: str

class PedidoResponse(BaseModel):
    id: int
    table_id: int
    waiter_id: int
    status: str
    notes: Optional[str] = None
    mesa: Optional[MesaResponse] = None
    waiter: Optional[ColaboradorResponse] = None
    detalles: List[DetallePedidoResponse] = []
    class Config:
        from_attributes = True
