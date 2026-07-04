from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..data.database import Base

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    table_id = Column(Integer, ForeignKey("mesas.id"), nullable=False)
    waiter_id = Column(Integer, ForeignKey("colaboradores.id"), nullable=False)
    status = Column(String(20), default="PENDIENTE")
    notes = Column(Text, nullable=True)

    mesa = relationship("Mesa", back_populates="pedidos")
    waiter = relationship("Colaborador", back_populates="pedidos")
    detalles = relationship("DetallePedido", back_populates="pedido", cascade="all, delete-orphan")
    venta = relationship("HistorialVenta", back_populates="pedido", uselist=False)
