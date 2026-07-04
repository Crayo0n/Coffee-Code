from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from ..data.database import Base

class DetallePedido(Base):
    __tablename__ = "detalle_pedidos"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    status = Column(String(20), default="PENDIENTE")

    pedido = relationship("Pedido", back_populates="detalles")
    producto = relationship("Producto", back_populates="detalles")
