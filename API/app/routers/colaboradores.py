from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.data.database import get_db
from app.models.colaborador import Colaborador
from app.data.schemas.colaborador import ColaboradorCreate, ColaboradorUpdate, ColaboradorPasswordUpdate, ColaboradorResponse
from app.security import get_current_user, get_password_hash, verify_password

router = APIRouter(prefix="/api/colaboradores", tags=["Colaboradores"])

@router.get("", response_model=List[ColaboradorResponse])
def get_colaboradores(
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    query = db.query(Colaborador)
    if role:
        query = query.filter(Colaborador.role == role)
    return query.all()

@router.post("", response_model=ColaboradorResponse, status_code=status.HTTP_201_CREATED)
def create_colaborador(
    user_in: ColaboradorCreate,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    # Validar si el email ya existe
    existing = db.query(Colaborador).filter(Colaborador.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Este correo electrónico ya está registrado")
        
    hashed_pwd = get_password_hash(user_in.password)
    new_user = Colaborador(
        name=user_in.name,
        email=user_in.email,
        role=user_in.role,
        shift=user_in.shift,
        password=hashed_pwd,
        photo=user_in.photo,
        status=user_in.status
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/me/profile", response_model=ColaboradorResponse)
def get_my_profile(current_user: Colaborador = Depends(get_current_user)):
    return current_user

@router.put("/me/profile", response_model=ColaboradorResponse)
def update_my_profile(
    profile_in: ColaboradorUpdate,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    if profile_in.name:
        current_user.name = profile_in.name
    if profile_in.photo is not None:
        current_user.photo = profile_in.photo
    if profile_in.password:
        current_user.password = get_password_hash(profile_in.password)
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/password")
def change_my_password(
    passwords: ColaboradorPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    if not verify_password(passwords.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta")
    if len(passwords.new_password) < 4:
        raise HTTPException(status_code=400, detail="La nueva contraseña debe tener al menos 4 caracteres")
        
    current_user.password = get_password_hash(passwords.new_password)
    db.commit()
    return {"message": "Contraseña actualizada con éxito"}

@router.put("/{id}", response_model=ColaboradorResponse)
def update_colaborador(
    id: int,
    user_in: ColaboradorUpdate,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    user = db.query(Colaborador).filter(Colaborador.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Colaborador no encontrado")
        
    if user_in.email and user_in.email != user.email:
        existing = db.query(Colaborador).filter(Colaborador.email == user_in.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado por otro colaborador")
            
    if user_in.name:
        user.name = user_in.name
    if user_in.email:
        user.email = user_in.email
    if user_in.role:
        user.role = user_in.role
    if user_in.shift:
        user.shift = user_in.shift
    if user_in.status:
        user.status = user_in.status
    if user_in.photo is not None:
        user.photo = user_in.photo
    if user_in.password:
        user.password = get_password_hash(user_in.password)
        
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{id}")
def delete_colaborador(
    id: int,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    user = db.query(Colaborador).filter(Colaborador.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Colaborador no encontrado")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propio usuario")
        
    db.delete(user)
    db.commit()
    return {"message": f"Colaborador {user.name} eliminado con éxito"}
