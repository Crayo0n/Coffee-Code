import os

file_path = r"c:\CAFECODE09\Coffee-Code\API\app\routers\estadisticas.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace colors
content = content.replace('colors.HexColor("#a37f6f")', 'colors.HexColor("#90694a")')
content = content.replace('colors.HexColor("#e6dac3")', 'colors.HexColor("#d3b895")')
content = content.replace('colors.HexColor("#f8fafc")', 'colors.HexColor("#fcf7fb")')

# Replace anonymous author
content = content.replace('author="Coffee-Code"', '') # Remove old one if exists to avoid duplicates
content = content.replace('SimpleDocTemplate(file_path, rightMargin=30, leftMargin=30, topMargin=50, bottomMargin=50)', 'SimpleDocTemplate(file_path, rightMargin=30, leftMargin=30, topMargin=50, bottomMargin=50, title="Reporte Coffee-Code", author="Coffee-Code")')
content = content.replace('SimpleDocTemplate(file_path, rightMargin=30, leftMargin=30, topMargin=50, bottomMargin=50, title="Pedidos", )', 'SimpleDocTemplate(file_path, rightMargin=30, leftMargin=30, topMargin=50, bottomMargin=50, title="Pedidos", author="Coffee-Code")')
content = content.replace('SimpleDocTemplate(file_path, rightMargin=30, leftMargin=30, topMargin=50, bottomMargin=50, title="Pedidos")', 'SimpleDocTemplate(file_path, rightMargin=30, leftMargin=30, topMargin=50, bottomMargin=50, title="Pedidos", author="Coffee-Code")')

# Add new ticket endpoint
new_endpoint = """

@router.get("/pedidos/{pedido_id}/ticket/pdf")
def exportar_ticket_pdf(pedido_id: int, db: Session = Depends(get_db)):
    from reportlab.lib.styles import ParagraphStyle
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido: return {"error": "Pedido no encontrado"}
    
    venta = db.query(HistorialVenta).filter(HistorialVenta.order_id == pedido_id).first()
    detalles = db.query(DetallePedido).filter(DetallePedido.pedido_id == pedido_id).all()
    productos = {p.id: p for p in db.query(Producto).all()}
    
    import tempfile, os
    from reportlab.platypus import Spacer
    file_path = os.path.join(tempfile.gettempdir(), f"ticket_{pedido_id}.pdf")
    doc = SimpleDocTemplate(file_path, rightMargin=40, leftMargin=40, topMargin=50, bottomMargin=50, title=f"Ticket Pedido #{pedido_id}", author="Coffee-Code")
    elementos = []

    # Encabezado
    header_data = [
        [Paragraph("<font size=20><b>COFFEE-CODE</b></font>", ParagraphStyle(name="Normal")), Paragraph("<font size=12 color='#888888'><b>Ticket de Venta</b></font>", ParagraphStyle(name="Normal"))]
    ]
    header_table = Table(header_data, colWidths=[300, 200])
    header_table.setStyle(TableStyle([
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 15),
    ]))
    elementos.append(header_table)

    # Info Cliente y Ticket
    fecha_str = f"{venta.date} {venta.hour}" if venta else "N/A"
    estado_str = pedido.status.upper() if pedido.status else "COMPLETADO"
    mesa_str = venta.table_name if venta else (pedido.table_name or "Mostrador")
    mesero_str = pedido.waiter.name if pedido.waiter else "Caja"
    info_data = [
        [Paragraph(f"<b>Mesa/Servicio:</b><br/>{mesa_str}<br/><b>Atendido por:</b> {mesero_str}", ParagraphStyle(name="Normal")), 
         Paragraph(f"<b>Ticket #{pedido_id}</b><br/>Fecha: {fecha_str}<br/>Estado: {estado_str}", ParagraphStyle(name="Normal"))]
    ]
    info_table = Table(info_data, colWidths=[250, 250])
    info_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('TOPPADDING', (0,0), (-1,-1), 10)]))
    elementos.append(info_table)
    elementos.append(Spacer(1, 20))

    # Productos
    total = 0
    tabla_data = [["Producto", "Cant.", "Precio U.", "Importe"]]
    for d in detalles:
        p = productos.get(d.producto_id)
        if p:
            sub = float(p.price) * int(d.cantidad)
            total += sub
            tabla_data.append([
                Paragraph(f"<b>{p.name}</b>", ParagraphStyle(name="Normal")),
                str(d.cantidad),
                f"${float(p.price):.2f}",
                f"${sub:.2f}"
            ])

    # Add totals
    tabla_data.append(["", "", "Subtotal:", f"${total:.2f}"])
    if venta and venta.tips:
        tabla_data.append(["", "", "Propina:", f"${float(venta.tips):.2f}"])
        total += float(venta.tips)
    tabla_data.append(["", "", "TOTAL:", f"${total:.2f}"])

    t = Table(tabla_data, colWidths=[200, 60, 100, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#90694a")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#d3b895")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('ALIGN', (1,1), (-1,-1), 'CENTER'),
        ('ALIGN', (2, -3), (2, -1), 'RIGHT'),
        ('FONTNAME', (2,-1), (-1,-1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (2,-1), (-1,-1), colors.HexColor("#90694a")),
    ]))
    elementos.append(t)

    # Footer
    elementos.append(Spacer(1, 30))
    elementos.append(Paragraph("<font size=10 color='#888888'>¡Gracias por su preferencia!</font>", ParagraphStyle(name="Center", alignment=1)))

    doc.build(elementos)

    return FileResponse(file_path, media_type="application/pdf", headers={"Content-Disposition": f"inline; filename=\\"ticket_{pedido_id}.pdf\\""})
"""

if "exportar_ticket_pdf" not in content:
    content += new_endpoint

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Ticket endpoint added and PDF metadata updated.")
