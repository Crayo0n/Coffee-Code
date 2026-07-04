from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..data.database import Base

class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

    productos = relationship("Producto", back_populates="categoria")
