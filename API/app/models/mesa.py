from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..data.database import Base

class Mesa(Base):
    __tablename__ = "mesas"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(Integer, unique=True, nullable=False)
    status = Column(String(15), default="available")

    pedidos = relationship("Pedido", back_populates="mesa")
