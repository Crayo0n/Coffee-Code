from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.data.database import get_db
from app.models.colaborador import Colaborador
from app.data.schemas.auth import Token, LoginRequest
from app.security import verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(Colaborador).filter(Colaborador.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.status != "activo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El colaborador está inactivo en el sistema"
        )
        
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login-json")
def login_json(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Endpoint alternativo para login desde aplicaciones móviles (JSON body).
    Devuelve el token + información del usuario para evitar una segunda llamada.
    """
    user = db.query(Colaborador).filter(Colaborador.email == credentials.username).first()
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.status != "activo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El colaborador está inactivo en el sistema"
        )

    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "nombre": user.name,
            "email": user.email,
            "rol": user.role.lower(),
            "status": user.status,
        }
    }
