from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.data.database import get_db
from app.models.categoria import Categoria
from app.models.estado_producto import EstadoProducto
from app.models.producto import Producto
from app.models.colaborador import Colaborador
from app.data.schemas.categoria import CategoriaCreate, CategoriaResponse
from app.data.schemas.estado_producto import EstadoProductoResponse
from app.data.schemas.producto import ProductoCreate, ProductoUpdate, ProductoResponse
from app.security import get_current_user

router = APIRouter(tags=["Menú e Inventario"])

# --- ENDPOINTS DE CATEGORÍAS ---
@router.get("/api/categorias", response_model=List[CategoriaResponse])
def get_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).all()

@router.post("/api/categorias", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
def create_categoria(
    cat_in: CategoriaCreate,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    existing = db.query(Categoria).filter(Categoria.name == cat_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Esta categoría ya existe")
        
    new_cat = Categoria(name=cat_in.name)
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

@router.delete("/api/categorias/{id}")
def delete_categoria(
    id: int,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    cat = db.query(Categoria).filter(Categoria.id == id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    db.delete(cat)
    db.commit()
    return {"message": f"Categoría '{cat.name}' eliminada"}

# --- ENDPOINTS DE ESTADOS DE PRODUCTOS ---
@router.get("/api/estados-productos", response_model=List[EstadoProductoResponse])
def get_estados_productos(db: Session = Depends(get_db)):
    return db.query(EstadoProducto).all()

# --- ENDPOINTS DE PRODUCTOS ---
@router.get("/api/productos", response_model=List[ProductoResponse])
def get_productos(
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Producto)
    if category_id:
        query = query.filter(Producto.category_id == category_id)
    return query.all()

@router.post("/api/productos", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
def create_producto(
    prod_in: ProductoCreate,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    existing = db.query(Producto).filter(Producto.name == prod_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un producto con este nombre")
        
    cat = db.query(Categoria).filter(Categoria.id == prod_in.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="La categoría especificada no existe")
        
    est = db.query(EstadoProducto).filter(EstadoProducto.id == prod_in.status_id).first()
    if not est:
        raise HTTPException(status_code=400, detail="El estado especificado no existe")
        
    new_prod = Producto(
        name=prod_in.name,
        price=prod_in.price,
        category_id=prod_in.category_id,
        status_id=prod_in.status_id,
        photo=prod_in.photo
    )
    db.add(new_prod)
    db.commit()
    db.refresh(new_prod)
    return new_prod

@router.put("/api/productos/{id}", response_model=ProductoResponse)
def update_producto(
    id: int,
    prod_in: ProductoUpdate,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    prod = db.query(Producto).filter(Producto.id == id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
        
    if prod_in.name and prod_in.name != prod.name:
        existing = db.query(Producto).filter(Producto.name == prod_in.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Ya existe otro producto con este nombre")
            
    if prod_in.category_id:
        cat = db.query(Categoria).filter(Categoria.id == prod_in.category_id).first()
        if not cat:
            raise HTTPException(status_code=400, detail="La categoría especificada no existe")
        prod.category_id = prod_in.category_id
        
    if prod_in.status_id:
        est = db.query(EstadoProducto).filter(EstadoProducto.id == prod_in.status_id).first()
        if not est:
            raise HTTPException(status_code=400, detail="El estado especificado no existe")
        prod.status_id = prod_in.status_id
        
    if prod_in.name:
        prod.name = prod_in.name
    if prod_in.price:
        prod.price = prod_in.price
    if prod_in.photo:
        prod.photo = prod_in.photo
        
    db.commit()
    db.refresh(prod)
    return prod

@router.delete("/api/productos/{id}")
def delete_producto(
    id: int,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    prod = db.query(Producto).filter(Producto.id == id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
        
    db.delete(prod)
    db.commit()
    return {"message": f"Producto {prod.name} eliminado con éxito"}
