from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..data.database import Base

class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    price = Column(Numeric(6, 2), nullable=False)
    category_id = Column(Integer, ForeignKey("categorias.id"), nullable=False)
    status_id = Column(Integer, ForeignKey("estados_productos.id"), nullable=False)
    stock = Column(Integer, default=50)
    photo = Column(Text, nullable=False)

    categoria = relationship("Categoria", back_populates="productos")
    estado = relationship("EstadoProducto", back_populates="productos")
    detalles = relationship("DetallePedido", back_populates="producto")
