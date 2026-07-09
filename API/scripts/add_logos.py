import sys

with open(r'c:\CAFECODE09\Coffee-Code\API\app\routers\estadisticas.py', 'r', encoding='utf-8') as f:
    content = f.read()

header_replacement = '''
    from reportlab.platypus import Image
    logo_path = r"c:\\CAFECODE09\\Coffee-Code\\API\\logo.png"
    logo = Image(logo_path, width=60, height=60) if __import__('os').path.exists(logo_path) else ""
    title_style = ParagraphStyle(name="TitleStyle", fontSize=18, textColor=colors.HexColor("#90694a"), alignment=1, fontName="Helvetica-Bold")
    title_p = Paragraph(r"{}", title_style)
    header_table = Table([[logo, title_p, ""]], colWidths=[80, 400, 80])
    header_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
    elementos.append(header_table)
    elementos.append(Spacer(1, 15))
'''

# We know the exact string because I wrote them recently.
s_pedidos = '''title_style = ParagraphStyle(name="TitleStyle", fontSize=18, textColor=colors.HexColor("#90694a"), spaceAfter=20, alignment=1, fontName="Helvetica-Bold")
    elementos.append(Paragraph("Reporte de Pedidos", title_style))'''

content = content.replace(s_pedidos, header_replacement.replace("{}", "Reporte de Pedidos"))

s_productos = '''title_style = ParagraphStyle(name="TitleStyle", fontSize=18, textColor=colors.HexColor("#90694a"), spaceAfter=20, alignment=1, fontName="Helvetica-Bold")
    elementos.append(Paragraph("Reporte de Productos", title_style))'''

content = content.replace(s_productos, header_replacement.replace("{}", "Reporte de Productos"))

s_kpis = '''title_style = ParagraphStyle(name="TitleStyle", fontSize=18, textColor=colors.HexColor("#90694a"), spaceAfter=20, alignment=1, fontName="Helvetica-Bold")
    elementos.append(Paragraph("Reporte de KPIs y Estadísticas", title_style))'''

content = content.replace(s_kpis, header_replacement.replace("{}", "Reporte de KPIs y Estadísticas"))

s_historial = '''title_style = ParagraphStyle(name="TitleStyle", fontSize=18, textColor=colors.HexColor("#90694a"), spaceAfter=20, alignment=1, fontName="Helvetica-Bold")
    elementos.append(Paragraph("Reporte de Historial de Ventas", title_style))'''

content = content.replace(s_historial, header_replacement.replace("{}", "Reporte de Historial de Ventas").replace("colWidths=[80, 400, 80]", "colWidths=[80, 540, 80]"))

with open(r'c:\CAFECODE09\Coffee-Code\API\app\routers\estadisticas.py', 'w', encoding='utf-8') as f:
    f.write(content)
