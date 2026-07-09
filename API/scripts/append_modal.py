import sys

with open(r'c:\CAFECODE09\Coffee-Code\API\app\routers\estadisticas.py', 'r', encoding='utf-8') as f:
    content = f.read()

modal_endpoint = '''

@router.get("/pedidos/{pedido_id}/detalles")
def get_pedido_detalles(pedido_id: int, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido: return {"error": "Pedido no encontrado"}
    
    venta = db.query(HistorialVenta).filter(HistorialVenta.order_id == pedido_id).first()
    detalles = db.query(DetallePedido).filter(DetallePedido.order_id == pedido_id).all()
    productos = {p.id: p for p in db.query(Producto).all()}
    
    items = []
    for d in detalles:
        p = productos.get(d.product_id)
        if p:
            items.append({
                "nombre": p.name,
                "cantidad": d.quantity,
                "precio": float(p.price),
                "importe": float(p.price) * int(d.quantity)
            })
            
    cliente = "Público en General"
    mesa = venta.table_name if venta else (pedido.table_name if pedido.table_name else "Mostrador")
    mesero = pedido.waiter.name if pedido.waiter else "Caja"
    
    return {
        "id_venta": venta.ticket_id if venta else pedido.id,
        "fecha": str(venta.date) if venta else "",
        "hora": str(venta.hour) if venta else "",
        "cliente": cliente,
        "mesa": mesa,
        "mesero": mesero,
        "items": items,
        "total": venta.total if venta else sum(i["importe"] for i in items),
        "estado": pedido.status
    }
'''

with open(r'c:\CAFECODE09\Coffee-Code\API\app\routers\estadisticas.py', 'a', encoding='utf-8') as f:
    f.write(modal_endpoint)
