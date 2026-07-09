import sys

with open(r'c:\CAFECODE09\Coffee-Code\API\app\routers\estadisticas.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix total in /pedidos/{pedido_id}/detalles
content = content.replace('venta.total if venta else sum(i["importe"] for i in items)', 'venta.total_paid if venta else sum(i["importe"] for i in items)')

# Fix total and items_count in /historial/excel
content = content.replace('v.items_count, v.total', 'len(pedido.detalles) if pedido else 0, v.total_paid')

# Fix total and items_count in /historial/pdf
content = content.replace('str(v.items_count), f""', 'str(len(pedido.detalles) if pedido else 0), f""')

with open(r'c:\CAFECODE09\Coffee-Code\API\app\routers\estadisticas.py', 'w', encoding='utf-8') as f:
    f.write(content)
