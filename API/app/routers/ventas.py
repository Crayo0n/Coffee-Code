from datetime import datetime
from decimal import Decimal
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.data.database import get_db
from app.models.pedido import Pedido
from app.models.historial_venta import HistorialVenta
from app.models.colaborador import Colaborador
from app.data.schemas.historial_venta import HistorialVentaCreate, HistorialVentaResponse
from app.security import get_current_user

router = APIRouter(prefix="/api/ventas", tags=["Historial de Ventas y Tickets"])

@router.get("", response_model=List[HistorialVentaResponse])
def get_historial_ventas(
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    return db.query(HistorialVenta).order_by(HistorialVenta.ticket_id.desc()).all()

@router.post("/cobrar", response_model=HistorialVentaResponse, status_code=status.HTTP_201_CREATED)
def cobrar_pedido(
    cobro_in: HistorialVentaCreate,
    db: Session = Depends(get_db),
    current_user: Colaborador = Depends(get_current_user)
):
    # 1. Obtener el pedido
    pedido = db.query(Pedido).filter(Pedido.id == cobro_in.order_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
        
    if pedido.status == "PAGADO":
        raise HTTPException(status_code=400, detail="Este pedido ya ha sido cobrado previamente")
        
    # 2. Calcular subtotal de consumo dinámicamente sumando productos
    subtotal = Decimal("0.00")
    for detail in pedido.detalles:
        subtotal += Decimal(str(detail.producto.price)) * detail.quantity
        
    # 3. Calcular totales finales
    tips = Decimal(str(cobro_in.tips))
    total_paid = subtotal + tips
    
    # 4. Registrar en el Historial de Ventas
    now = datetime.now()
    ticket = HistorialVenta(
        order_id=pedido.id,
        date=now.date(),
        hour=now.time(),
        table_name=f"Mesa {pedido.mesa.number}",
        subtotal=subtotal,
        tips=tips,
        total_paid=total_paid,
        payment_method=cobro_in.payment_method.upper(),
        cashier_email=current_user.email
    )
    db.add(ticket)
    
    # 5. Cambiar estado del pedido a PAGADO
    pedido.status = "PAGADO"
    
    # 6. Liberar la mesa física
    pedido.mesa.status = "Libre"
    
    db.commit()
    db.refresh(ticket)
    return ticket
