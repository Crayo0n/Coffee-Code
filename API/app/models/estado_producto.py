from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..data.database import Base

class EstadoProducto(Base):
    __tablename__ = "estados_productos"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(30), unique=True, nullable=False)

    productos = relationship("Producto", back_populates="estado")
