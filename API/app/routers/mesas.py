from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.data.database import get_db
from app.models.mesa import Mesa
from app.models.colaborador import Colaborador
from app.data.schemas.mesa import MesaBase, MesaCreate, MesaResponse
from app.security import get_current_user

router = APIRouter(prefix="/api/mesas", tags=["Mesas"])

@router.get("", response_model=List[MesaResponse])
def get_mesas(db: Session = Depends(get_db)):
    return db.query(Mesa).order_by(Mesa.number).all()

@router.post("", response_model=MesaResponse, status_code=status.HTTP_201_CREATED)
def create_mesa(
    mesa_in: MesaCreate,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    existing = db.query(Mesa).filter(Mesa.number == mesa_in.number).first()
    if existing:
        raise HTTPException(status_code=400, detail="El número de mesa ya está registrado")
        
    new_mesa = Mesa(number=mesa_in.number, status=mesa_in.status)
    db.add(new_mesa)
    db.commit()
    db.refresh(new_mesa)
    return new_mesa

@router.put("/{id}/status", response_model=MesaResponse)
def update_mesa_status(
    id: int,
    status_in: MesaBase,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    mesa = db.query(Mesa).filter(Mesa.id == id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
        
    mesa.status = status_in.status
    db.commit()
    db.refresh(mesa)
    return mesa
