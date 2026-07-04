from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from ..data.database import Base

class Colaborador(Base):
    __tablename__ = "colaboradores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    role = Column(String(20), nullable=False)
    shift = Column(String(15), nullable=False)
    password = Column(String(255), nullable=False)
    photo = Column(Text, nullable=True)
    status = Column(String(10), default="activo")

    pedidos = relationship("Pedido", back_populates="waiter")
