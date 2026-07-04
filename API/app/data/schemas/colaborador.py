from pydantic import BaseModel, EmailStr
from typing import Optional

class ColaboradorBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    shift: str
    photo: Optional[str] = None
    status: Optional[str] = "activo"

class ColaboradorCreate(ColaboradorBase):
    password: str

class ColaboradorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    shift: Optional[str] = None
    photo: Optional[str] = None
    status: Optional[str] = None
    password: Optional[str] = None

class ColaboradorPasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class ColaboradorResponse(ColaboradorBase):
    id: int
    class Config:
        from_attributes = True
