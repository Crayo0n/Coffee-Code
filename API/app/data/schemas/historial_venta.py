from pydantic import BaseModel
from decimal import Decimal
from datetime import date, time
from typing import Optional

class HistorialVentaBase(BaseModel):
    order_id: int
    payment_method: str
    tips: Optional[Decimal] = Decimal("0.00")

class HistorialVentaCreate(HistorialVentaBase):
    pass

class HistorialVentaResponse(BaseModel):
    ticket_id: int
    order_id: int
    date: date
    hour: time
    table_name: str
    subtotal: Decimal
    tips: Decimal
    total_paid: Decimal
    payment_method: str
    cashier_email: str
    class Config:
        from_attributes = True
