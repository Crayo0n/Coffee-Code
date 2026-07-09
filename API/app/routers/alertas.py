from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.data.database import get_db
from app.models.alerta import Alerta
from app.models.colaborador import Colaborador
from app.data.schemas.alerta import AlertaCreate, AlertaResponse
from app.security import get_current_user

router = APIRouter(prefix="/api/alertas", tags=["Alertas de Cocina"])

@router.get("", response_model=List[AlertaResponse])
def get_alertas(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    query = db.query(Alerta)
    if unread_only:
        query = query.filter(Alerta.is_read == False)
    return query.order_by(Alerta.created_at.desc()).all()

@router.post("", response_model=AlertaResponse, status_code=status.HTTP_201_CREATED)
def create_alerta(
    alerta_in: AlertaCreate,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    new_alerta = Alerta(title=alerta_in.title, description=alerta_in.description)
    db.add(new_alerta)
    db.commit()
    db.refresh(new_alerta)
    return new_alerta

@router.put("/{id}/read", response_model=AlertaResponse)
def mark_alerta_read(
    id: int,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    alerta = db.query(Alerta).filter(Alerta.id == id).first()
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    alerta.is_read = True
    db.commit()
    db.refresh(alerta)
    return alerta
