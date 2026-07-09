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
from app.data.schemas.detalle_pedido import DetallePedidoCreate, DetallePedidoUpdateQuantity, DetallePedidoUpdateStatus, DetallePedidoResponse
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
    
    # 4. Crear detalles del pedido y descontar stock
    for item in pedido_in.detalles:
        prod = db.query(Producto).filter(Producto.id == item.product_id).first()
        if not prod:
            raise HTTPException(status_code=400, detail=f"El producto con ID {item.product_id} no existe")
            
        if prod.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {prod.name}. Disponibles: {prod.stock}")
            
        prod.stock -= item.quantity
            
        detail = DetallePedido(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            status="PENDIENTE"
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
        
    allowed_statuses = ["PENDIENTE", "PREPARANDO", "LISTO", "POR_COBRAR", "PAGADO", "CANCELADO"]
    status_upper = status_in.status.upper()
    if status_upper not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Estado '{status_in.status}' no válido")
        
    # Si el pedido se cancela, la mesa se libera y se regresa el stock
    if status_upper == "CANCELADO" and pedido.status != "CANCELADO":
        pedido.mesa.status = "available"
        for detail in pedido.detalles:
            if detail.producto:
                detail.producto.stock += detail.quantity
                
    pedido.status = status_upper
    db.commit()
    db.refresh(pedido)
    return pedido

@router.post("/{id}/detalles", response_model=List[DetallePedidoResponse], status_code=status.HTTP_201_CREATED)
def add_detalles_to_pedido(
    id: int,
    detalles_in: List[DetallePedidoCreate],
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    pedido = db.query(Pedido).filter(Pedido.id == id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    if pedido.status in ["POR_COBRAR", "PAGADO", "CANCELADO"]:
        raise HTTPException(status_code=400, detail="No se pueden agregar productos a un pedido cobrado o cancelado")

    new_details = []
    for item in detalles_in:
        prod = db.query(Producto).filter(Producto.id == item.product_id).first()
        if not prod:
            raise HTTPException(status_code=400, detail=f"Producto {item.product_id} no existe")
            
        if prod.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {prod.name}. Disponibles: {prod.stock}")
            
        prod.stock -= item.quantity
            
        detail = DetallePedido(
            order_id=pedido.id,
            product_id=item.product_id,
            quantity=item.quantity,
            status="PENDIENTE"
        )
        db.add(detail)
        new_details.append(detail)
        
    db.commit()
    for d in new_details:
        db.refresh(d)
    return new_details

@router.put("/{id}/detalles/{detalle_id}/cantidad", response_model=DetallePedidoResponse)
def update_detalle_cantidad(
    id: int,
    detalle_id: int,
    cantidad_in: DetallePedidoUpdateQuantity,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    detail = db.query(DetallePedido).filter(DetallePedido.id == detalle_id, DetallePedido.order_id == id).first()
    if not detail:
        raise HTTPException(status_code=404, detail="Detalle no encontrado en este pedido")
        
    if detail.pedido.status in ["POR_COBRAR", "PAGADO", "CANCELADO"]:
        raise HTTPException(status_code=400, detail="No se puede modificar un pedido cobrado o cancelado")

    if cantidad_in.quantity <= 0:
        raise HTTPException(status_code=400, detail="La cantidad debe ser mayor a cero")

    # Calcular diferencia para ajustar el stock
    diff = cantidad_in.quantity - detail.quantity
    if diff > 0 and detail.producto.stock < diff:
        raise HTTPException(status_code=400, detail=f"Stock insuficiente para incrementar. Disponibles: {detail.producto.stock}")
        
    detail.producto.stock -= diff
    detail.quantity = cantidad_in.quantity
    db.commit()
    db.refresh(detail)
    return detail

@router.delete("/{id}/detalles/{detalle_id}")
def delete_detalle(
    id: int,
    detalle_id: int,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    detail = db.query(DetallePedido).filter(DetallePedido.id == detalle_id, DetallePedido.order_id == id).first()
    if not detail:
        raise HTTPException(status_code=404, detail="Detalle no encontrado en este pedido")
        
        
    if detail.pedido.status in ["POR_COBRAR", "PAGADO", "CANCELADO"]:
        raise HTTPException(status_code=400, detail="No se puede modificar un pedido cobrado o cancelado")

    # Restaurar stock
    detail.producto.stock += detail.quantity

    db.delete(detail)
    db.commit()
    return {"message": "Producto eliminado del pedido exitosamente"}

@router.put("/{id}/detalles/{detalle_id}/status", response_model=DetallePedidoResponse)
def update_detalle_status(
    id: int,
    detalle_id: int,
    status_in: DetallePedidoUpdateStatus,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    detail = db.query(DetallePedido).filter(DetallePedido.id == detalle_id, DetallePedido.order_id == id).first()
    if not detail:
        raise HTTPException(status_code=404, detail="Detalle no encontrado en este pedido")
        
    allowed_statuses = ["PENDIENTE", "PREPARANDO", "PREPARADO", "LISTO"]
    status_upper = status_in.status.upper()
    if status_upper not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Estado no válido para el platillo")

    detail.status = status_upper
    db.commit()
    db.refresh(detail)
    return detail

