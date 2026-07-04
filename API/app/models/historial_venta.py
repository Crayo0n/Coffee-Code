from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, Date, Time
from sqlalchemy.orm import relationship
from ..data.database import Base

class HistorialVenta(Base):
    __tablename__ = "historial_ventas"

    ticket_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    date = Column(Date, nullable=False)
    hour = Column(Time, nullable=False)
    table_name = Column(String(20), nullable=False)
    subtotal = Column(Numeric(6, 2), nullable=False)
    tips = Column(Numeric(6, 2), default=0.00)
    total_paid = Column(Numeric(6, 2), nullable=False)
    payment_method = Column(String(15), nullable=False)
    cashier_email = Column(String(100), nullable=False)

    pedido = relationship("Pedido", back_populates="venta")
