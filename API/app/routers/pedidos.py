from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.data.database import get_db
from app.models.mesa import Mesa
from app.models.colaborador import Colaborador
from app.models.producto import Producto
from app.models.pedido import Pedido
from app.models.detalle_pedido import DetallePedido
from app.data.schemas.pedido import PedidoCreate, PedidoUpdateStatus, PedidoResponse
from app.security import get_current_user

router = APIRouter(prefix="/api/pedidos", tags=["Pedidos y Comandas"])

@router.get("", response_model=List[PedidoResponse])
def get_pedidos(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    query = db.query(Pedido)
    if status:
        query = query.filter(Pedido.status == status.upper())
    return query.all()

@router.get("/{id}", response_model=PedidoResponse)
def get_pedido(
    id: int,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    pedido = db.query(Pedido).filter(Pedido.id == id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido

@router.post("", response_model=PedidoResponse, status_code=status.HTTP_201_CREATED)
def create_pedido(
    pedido_in: PedidoCreate,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    # 1. Validar que la mesa exista
    mesa = db.query(Mesa).filter(Mesa.id == pedido_in.table_id).first()
    if not mesa:
        raise HTTPException(status_code=400, detail="La mesa seleccionada no existe")
        
    # 2. Cambiar mesa a ocupada
    mesa.status = "busy"
    
    # 3. Crear cabecera del pedido
    new_order = Pedido(
        table_id=pedido_in.table_id,
        waiter_id=current_user.id,
        status="PENDIENTE",
        notes=pedido_in.notes
    )
    db.add(new_order)
    db.flush()
    
    # 4. Crear detalles del pedido
    for item in pedido_in.detalles:
        prod = db.query(Producto).filter(Producto.id == item.product_id).first()
        if not prod:
            raise HTTPException(status_code=400, detail=f"El producto con ID {item.product_id} no existe")
            
        detail = DetallePedido(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(detail)
        
    db.commit()
    db.refresh(new_order)
    return new_order

@router.put("/{id}/status", response_model=PedidoResponse)
def update_pedido_status(
    id: int,
    status_in: PedidoUpdateStatus,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    pedido = db.query(Pedido).filter(Pedido.id == id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
        
    allowed_statuses = ["PENDIENTE", "PREPARANDO", "LISTO", "POR_COBRAR", "PAGADO"]
    status_upper = status_in.status.upper()
    if status_upper not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Estado '{status_in.status}' no válido")
        
    pedido.status = status_upper
    db.commit()
    db.refresh(pedido)
    return pedido
