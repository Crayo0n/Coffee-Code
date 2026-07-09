import sys
import re

with open(r'c:\CAFECODE09\Coffee-Code\API\app\routers\estadisticas.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new exportar_ticket_pdf
new_ticket_pdf = '''def exportar_ticket_pdf(pedido_id: int, db: Session = Depends(get_db)):
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
    from reportlab.lib import colors
    
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido: return {"error": "Pedido no encontrado"}
    
    venta = db.query(HistorialVenta).filter(HistorialVenta.order_id == pedido_id).first()
    detalles = db.query(DetallePedido).filter(DetallePedido.order_id == pedido_id).all()
    productos = {p.id: p for p in db.query(Producto).all()}
    
    import tempfile, os
    file_path = os.path.join(tempfile.gettempdir(), f"ticket_{pedido_id}.pdf")
    
    # We use letter size but with large margins to simulate a centered ticket on the page
    doc = SimpleDocTemplate(file_path, pagesize=letter, rightMargin=150, leftMargin=150, topMargin=50, bottomMargin=50, title=f"Ticket Pedido #{pedido_id}", author="Coffee-Code")
    elementos = []
    
    styles = getSampleStyleSheet()
    center_style = ParagraphStyle(name="Center", alignment=1)
    title_style = ParagraphStyle(name="Title", alignment=1, fontSize=18, textColor=colors.HexColor("#90694a"), fontName="Helvetica-Bold", spaceAfter=5)
    
    # Logo
    logo_path = r"c:\CAFECODE09\Coffee-Code\API\logo.png"
    if os.path.exists(logo_path):
        img = Image(logo_path, width=80, height=80)
        img.hAlign = 'CENTER'
        elementos.append(img)
        elementos.append(Spacer(1, 10))
        
    fecha_str = f"{venta.date} {venta.hour}" if venta else "N/A"
    estado_str = pedido.status.upper() if pedido.status else "COMPLETADO"
    mesa_str = venta.table_name if venta else (pedido.table_name or "Mostrador")
    mesero_str = pedido.waiter.name if pedido.waiter else "Caja"
    
    # Header text
    elementos.append(Paragraph("Coffee-Code", title_style))
    elementos.append(Paragraph("Ticket de Venta", center_style))
    elementos.append(Paragraph(f"<font size=10>ID: {pedido_id} | {fecha_str}</font>", center_style))
    elementos.append(Spacer(1, 15))
    
    # Client Info
    info_style = ParagraphStyle(name="Info", fontSize=11, leading=14)
    elementos.append(Paragraph(f"<b>Cliente:</b> Público en General", info_style))
    elementos.append(Paragraph(f"<b>Mesa:</b> {mesa_str}", info_style))
    elementos.append(Paragraph(f"<b>Mesero:</b> {mesero_str}", info_style))
    elementos.append(Paragraph(f"<b>Estado:</b> {estado_str}", info_style))
    elementos.append(Spacer(1, 15))
    
    # Table headers
    tabla_data = [["Cant", "Art", "Total"]]
    total = 0
    
    for d in detalles:
        p = productos.get(d.product_id)
        if p:
            sub = float(p.price) * int(d.quantity)
            total += sub
            tabla_data.append([str(d.quantity), p.name, f""])
            
    # Items Table
    t = Table(tabla_data, colWidths=[40, 160, 80])
    t.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,0), 1, colors.HexColor("#dddddd")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('ALIGN', (2,0), (2,-1), 'RIGHT'),
        ('PADDING', (0,0), (-1,-1), 6)
    ]))
    elementos.append(t)
    elementos.append(Spacer(1, 10))
    
    # Totals
    total_data = []
    if venta and venta.tips:
        total_data.append(["Propina:", f""])
        total += float(venta.tips)
    total_data.append(["TOTAL:", f""])
    
    total_table = Table(total_data, colWidths=[100, 80])
    total_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,-1), (-1,-1), 12),
        ('LINEABOVE', (0,-1), (-1,-1), 1, colors.HexColor("#352728")),
        ('TOPPADDING', (0,-1), (-1,-1), 8)
    ]))
    
    layout = Table([["", total_table]], colWidths=[100, 180])
    elementos.append(layout)
    
    elementos.append(Spacer(1, 30))
    elementos.append(Paragraph("<font size=10 color='#888888'>¡Gracias por su compra!</font>", center_style))
    
    doc.build(elementos)
    return FileResponse(file_path, media_type="application/pdf", headers={"Content-Disposition": f"inline; filename=\\"ticket_{pedido_id}.pdf\\""})
'''

# We need to replace the entire exportar_ticket_pdf function
# It starts with 'def exportar_ticket_pdf(pedido_id: int, db: Session = Depends(get_db)):'
# and ends right before '@router.get("/historial/excel")'

start_idx = content.find('def exportar_ticket_pdf(pedido_id: int, db: Session = Depends(get_db)):')
end_idx = content.find('@router.get("/historial/excel")')

if start_idx != -1 and end_idx != -1:
    # Adjust end_idx to remove preceding decorators if needed, but here we just replace the body
    content = content[:start_idx] + new_ticket_pdf + "\n\n" + content[end_idx:]
    with open(r'c:\CAFECODE09\Coffee-Code\API\app\routers\estadisticas.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Ticket PDF logic replaced.")
else:
    print("Could not find the function block to replace.")
