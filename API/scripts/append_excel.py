import os

file_path = r"c:\CAFECODE09\Coffee-Code\API\app\routers\estadisticas.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Make sure we import openpyxl stuff at the top or inside the functions
openpyxl_imports = "from openpyxl import Workbook\nfrom openpyxl.styles import Font, PatternFill, Alignment, Border, Side\n"

def make_excel_replacement(target_func_name, title, cols_code, data_code):
    return f"""
    {openpyxl_imports}
    wb = Workbook()
    ws = wb.active
    ws.title = "{title}"
    
    # Estilos
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="90694a", end_color="90694a", fill_type="solid")
    center_align = Alignment(horizontal="center", vertical="center")
    border = Border(left=Side(style='thin', color='d3b895'), 
                    right=Side(style='thin', color='d3b895'), 
                    top=Side(style='thin', color='d3b895'), 
                    bottom=Side(style='thin', color='d3b895'))

    {cols_code}
    
    for col_num, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_num, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = center_align
        cell.border = border

    {data_code}

    for row_num, row_data in enumerate(data, 2):
        for col_num, cell_value in enumerate(row_data, 1):
            cell = ws.cell(row=row_num, column=col_num, value=cell_value)
            cell.alignment = center_align
            cell.border = border
            
    for col in ws.columns:
        max_length = 0
        column = col[0].column_letter
        for cell in col:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = (max_length + 4)
        ws.column_dimensions[column].width = adjusted_width

    file_path = os.path.join(tempfile.gettempdir(), "{title.lower()}.xlsx")
    wb.save(file_path)
    return FileResponse(file_path, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={{"Content-Disposition": f"attachment; filename=\\"{title.lower()}.xlsx\\""}})
"""

import re

# We need to replace the body of the three excel functions.
# 1. exportar_pedidos_excel
pedidos_cols = "headers = ['ID Pedido', 'Mesa', 'Estado', 'Artículos']"
pedidos_data = """
    data = []
    for p in pedidos:
        mesa_txt = p.table_name if p.table_name else "Mostrador"
        data.append([p.id, mesa_txt, p.status, len(p.detalles)])
"""

# Regex to replace the body of exportar_pedidos_excel
p_excel_pattern = r'def exportar_pedidos_excel.*?return FileResponse[^\n]*\n'
content = re.sub(p_excel_pattern, 'def exportar_pedidos_excel(start_date: Optional[str] = Query(None), end_date: Optional[str] = Query(None), db: Session = Depends(get_db)):\n' + 
                 '    query = db.query(Pedido).join(HistorialVenta, Pedido.id == HistorialVenta.order_id)\n' +
                 '    if start_date:\n' +
                 '        query = query.filter(HistorialVenta.date >= start_date)\n' +
                 '    if end_date:\n' +
                 '        query = query.filter(HistorialVenta.date <= end_date)\n' +
                 '    pedidos = query.all()\n' + 
                 make_excel_replacement('exportar_pedidos_excel', 'Reporte_Pedidos', pedidos_cols, pedidos_data), content, flags=re.DOTALL)


# 2. exportar_productos_excel
productos_cols = "headers = ['ID Producto', 'Nombre', 'Categoría', 'Precio']"
productos_data = """
    data = []
    for p in productos:
        cat_name = p.categoria.name if p.categoria else "General"
        data.append([p.id, p.name, cat_name, float(p.price)])
"""
prod_excel_pattern = r'def exportar_productos_excel.*?return FileResponse[^\n]*\n'
content = re.sub(prod_excel_pattern, 'def exportar_productos_excel(categoria: Optional[str] = Query(None), db: Session = Depends(get_db)):\n' + 
                 '    query = db.query(Producto)\n' +
                 '    if categoria and categoria != "ALL":\n' +
                 '        query = query.join(Categoria).filter(Categoria.name == categoria)\n' +
                 '    productos = query.all()\n' +
                 make_excel_replacement('exportar_productos_excel', 'Reporte_Productos', productos_cols, productos_data), content, flags=re.DOTALL)


# 3. exportar_kpis_excel
kpis_cols = "headers = ['Métrica', 'Valor']"
kpis_data = """
    data = [
        ["Ventas del Día", kpis['ventas_del_dia']],
        ["Tickets Emitidos", kpis['tickets_emitidos']],
        ["Ticket Promedio", kpis['ticket_promedio']],
        ["Valor de Inventario", kpis['valor_inventario']]
    ]
"""
kpi_excel_pattern = r'def exportar_kpis_excel.*?return FileResponse[^\n]*\n'
content = re.sub(kpi_excel_pattern, 'def exportar_kpis_excel(start_date: Optional[str] = Query(None), end_date: Optional[str] = Query(None), db: Session = Depends(get_db)):\n' + 
                 '    kpis = get_kpis(start_date, end_date, db)\n' +
                 make_excel_replacement('exportar_kpis_excel', 'Reporte_KPIs', kpis_cols, kpis_data), content, flags=re.DOTALL)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Excel endpoints updated with openpyxl styling.")
