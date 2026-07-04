import datetime
from decimal import Decimal
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.data.database import get_db
from app.models.historial_venta import HistorialVenta
from app.models.pedido import Pedido
from app.models.producto import Producto
from app.models.categoria import Categoria
from app.models.colaborador import Colaborador
from app.models.detalle_pedido import DetallePedido
from app.data.schemas.dashboard import DashboardMetrics

router = APIRouter(prefix="/api/estadisticas", tags=["Inteligencia de Negocio y Reportes"])

def get_date_range(periodo: str):
    today = datetime.date.today()
    if periodo == "ULTIMOSTRINTA":
        return today - datetime.timedelta(days=30), today
    elif periodo == "SEMANAL":
        return today - datetime.timedelta(days=7), today
    elif periodo == "ANUAL":
        return today.replace(month=1, day=1), today
    else: # ESTEMES (default)
        return today.replace(day=1), today

# --- ENDPOINT PARA KPIs DEL DASHBOARD ---
@router.get("/dashboard-kpis", response_model=DashboardMetrics)
def get_dashboard_kpis(db: Session = Depends(get_db)):
    today = datetime.date.today()
    sales_sum = db.query(func.sum(HistorialVenta.total_paid)).filter(HistorialVenta.date == today).scalar()
    sales_today = Decimal(str(sales_sum)) if sales_sum else Decimal("0.00")
    
    active_orders_count = db.query(Pedido).filter(Pedido.status != "PAGADO").count()
    total_products = db.query(Producto).count()
    total_users = db.query(Colaborador).count()
    
    return {
        "sales_today": sales_today,
        "active_orders_count": active_orders_count,
        "total_products": total_products,
        "total_users": total_users
    }

# --- ENDPOINT PARA REPORTE FINANCIERO (LIBRO AUXILIAR) ---
@router.get("/reporte-financiero")
def get_reporte_financiero(periodo: str = "ESTEMES", db: Session = Depends(get_db)):
    start_date, end_date = get_date_range(periodo)
    sales = db.query(HistorialVenta).filter(
        HistorialVenta.date >= start_date,
        HistorialVenta.date <= end_date
    ).all()
    total_sales = sum(Decimal(str(ticket.total_paid)) for ticket in sales)
    
    semanas = []
    # Calcular semanas reales desde la base de datos basándose en el día del mes
    week1_sales = sum(Decimal(str(t.total_paid)) for t in sales if 1 <= t.date.day <= 7)
    week2_sales = sum(Decimal(str(t.total_paid)) for t in sales if 8 <= t.date.day <= 14)
    week3_sales = sum(Decimal(str(t.total_paid)) for t in sales if 15 <= t.date.day <= 21)
    week4_sales = sum(Decimal(str(t.total_paid)) for t in sales if 22 <= t.date.day <= 31)
    
    ventas_semanales = [
        ("Semana 1", week1_sales, "Inicio de Mes"),
        ("Semana 2", week2_sales, "Estable"),
        ("Semana 3", week3_sales, "Estable"),
        ("Semana 4", week4_sales, "Alta Demanda")
    ]
    for label, ventas, estado in ventas_semanales:
        costo = ventas * Decimal("0.40")
        gasto = Decimal("800.00")
        utilidad = ventas - costo - gasto
        pct = float(utilidad / ventas * 100) if ventas > 0 else 0.0
        semanas.append({
            "periodo": label,
            "ventas_brutas": ventas,
            "costo_insumos": costo,
            "gasto_operativo": gasto,
            "utilidad_neta": utilidad,
            "porcentaje_neto": round(pct, 1),
            "estado": estado
        })
            
    costo_insumos = total_sales * Decimal("0.40")
    gasto_operativo = Decimal("3200.00")
    utilidad_neta = total_sales - costo_insumos - gasto_operativo
    pct_neto = float(utilidad_neta / total_sales * 100) if total_sales > 0 else 0.0
    
    # Histórico de meses anteriores (Abril y Marzo)
    abril_sales = sum(Decimal(str(t.total_paid)) for t in sales if t.date.month == 4 and t.date.year == 2026)
    abril_costo = abril_sales * Decimal("0.40")
    abril_gasto = Decimal("3200.00")
    abril_utilidad = abril_sales - abril_costo - abril_gasto
    abril_pct = float(abril_utilidad / abril_sales * 100) if abril_sales > 0 else 0.0
    
    marzo_sales = sum(Decimal(str(t.total_paid)) for t in sales if t.date.month == 3 and t.date.year == 2026)
    marzo_costo = marzo_sales * Decimal("0.40")
    marzo_gasto = Decimal("3200.00")
    marzo_utilidad = marzo_sales - marzo_costo - marzo_gasto
    marzo_pct = float(marzo_utilidad / marzo_sales * 100) if marzo_sales > 0 else 0.0
    
    historico = [
        {
            "mes": "Abril 2026",
            "ventas_brutas": abril_sales,
            "costo_insumos": abril_costo,
            "gasto_operativo": abril_gasto,
            "utilidad_neta": abril_utilidad,
            "porcentaje_neto": round(abril_pct, 1),
            "estado": "Cerrado"
        },
        {
            "mes": "Marzo 2026",
            "ventas_brutas": marzo_sales,
            "costo_insumos": marzo_costo,
            "gasto_operativo": marzo_gasto,
            "utilidad_neta": marzo_utilidad,
            "porcentaje_neto": round(marzo_pct, 1),
            "estado": "Cerrado"
        }
    ]
    
    return {
        "ventas_brutas": total_sales,
        "costo_insumos": costo_insumos,
        "gasto_operativo": gasto_operativo,
        "utilidad_neta": utilidad_neta,
        "porcentaje_neto": round(pct_neto, 1),
        "semanas": semanas,
        "historico": historico
    }
# --- ENDPOINT PARA REPORTE DE POPULARIDAD DE CATÁLOGO ---
@router.get("/reporte-productos")
def get_reporte_productos(periodo: str = "ESTEMES", db: Session = Depends(get_db)):
    start_date, end_date = get_date_range(periodo)
    results = db.query(
        Producto.name,
        Categoria.name.label("categoria"),
        func.sum(DetallePedido.quantity).label("vendidos"),
        Producto.price
    ).join(
        DetallePedido, Producto.id == DetallePedido.product_id
    ).join(
        Categoria, Producto.category_id == Categoria.id
    ).join(
        Pedido, DetallePedido.order_id == Pedido.id
    ).join(
        HistorialVenta, HistorialVenta.order_id == Pedido.id
    ).filter(
        Pedido.status == "PAGADO",
        HistorialVenta.date >= start_date,
        HistorialVenta.date <= end_date
    ).group_by(
        Producto.id, Categoria.id
    ).order_by(
        func.sum(DetallePedido.quantity).desc()
    ).all()
    
    products_report = []
    for r in results:
        recaudacion = Decimal(str(r.vendidos)) * Decimal(str(r.price))
        costo_promedio = Decimal(str(r.price)) * Decimal("0.40")
        margen_unitario = Decimal(str(r.price)) - costo_promedio
        
        products_report.append({
            "name": r.name,
            "category": r.categoria,
            "units_sold": r.vendidos,
            "price": r.price,
            "revenue": recaudacion,
            "cost_unit": costo_promedio,
            "margin_unit": margen_unitario
        })
        

    return products_report

# --- ENDPOINT PARA FLUJO HORARIO Y MÉTODOS DE PAGO ---
@router.get("/reporte-flujo")
def get_reporte_flujo(periodo: str = "ESTEMES", db: Session = Depends(get_db)):
    start_date, end_date = get_date_range(periodo)
    tarjeta_count = db.query(HistorialVenta).filter(
        HistorialVenta.payment_method == "TARJETA",
        HistorialVenta.date >= start_date,
        HistorialVenta.date <= end_date
    ).count()
    efectivo_count = db.query(HistorialVenta).filter(
        HistorialVenta.payment_method == "EFECTIVO",
        HistorialVenta.date >= start_date,
        HistorialVenta.date <= end_date
    ).count()
    total = tarjeta_count + efectivo_count
    
    tarjeta_pct = (tarjeta_count / total * 100) if total > 0 else 0.0
    efectivo_pct = (efectivo_count / total * 100) if total > 0 else 0.0
    
    sales = db.query(HistorialVenta).filter(
        HistorialVenta.date >= start_date,
        HistorialVenta.date <= end_date
    ).all()
    
    bloques = []
    # Calcular bloques reales desde la base de datos
    b1_sales = [s for s in sales if datetime.time(7, 0) <= s.hour < datetime.time(10, 0)]
    b2_sales = [s for s in sales if datetime.time(10, 0) <= s.hour < datetime.time(13, 0)]
    b3_sales = [s for s in sales if datetime.time(13, 0) <= s.hour < datetime.time(16, 0)]
    b4_sales = [s for s in sales if datetime.time(16, 0) <= s.hour <= datetime.time(23, 59) or datetime.time(0, 0) <= s.hour < datetime.time(7, 0)]
    
    ventas_bloques = [
        ("07:00 AM - 10:00 AM (Apertura y Desayunos)", b1_sales),
        ("10:00 AM - 01:00 PM (Hora Valle Mañana)", b2_sales),
        ("01:00 PM - 04:00 PM (Hora Almuerzo)", b3_sales),
        ("04:00 PM - 07:00 PM (Tarde y Cierre)", b4_sales)
    ]
    for label, block_sales in ventas_bloques:
        pedidos_count = len(block_sales)
        volumen = sum(Decimal(str(s.total_paid)) for s in block_sales)
        
        if pedidos_count >= 10:
            estado = "TRÁFICO CRÍTICO"
        elif pedidos_count >= 5:
            estado = "FLUJO ELEVADO"
        elif pedidos_count >= 2:
            estado = "FLUJO MODERADO"
        else:
            estado = "BAJO FLUJO"
            
        mesa_activa = "N/A"
        if block_sales:
            from collections import Counter
            mesa_counts = Counter(s.table_name for s in block_sales)
            mesa_activa = mesa_counts.most_common(1)[0][0]
            
        bloques.append({
            "periodo": label,
            "pedidos": pedidos_count,
            "volumen_ventas": volumen,
            "tiempo_prep": "N/A",
            "mesa_activa": mesa_activa,
            "estado": estado
        })
            
    # Calcular origen de pedidos
    total_orders = db.query(Pedido).join(HistorialVenta, HistorialVenta.order_id == Pedido.id).filter(
        HistorialVenta.date >= start_date,
        HistorialVenta.date <= end_date
    ).count()
    expo_orders = db.query(Pedido).join(Colaborador, Pedido.waiter_id == Colaborador.id).join(HistorialVenta, HistorialVenta.order_id == Pedido.id).filter(
        Colaborador.role == "MESERO",
        HistorialVenta.date >= start_date,
        HistorialVenta.date <= end_date
    ).count()
    caja_orders = total_orders - expo_orders
    
    expo_pct = round((expo_orders / total_orders * 100), 1) if total_orders > 0 else 0.0
    caja_pct = round((caja_orders / total_orders * 100), 1) if total_orders > 0 else 0.0
    
    return {
        "metodos_pago": {
            "tarjeta_porcentaje": round(tarjeta_pct, 1),
            "efectivo_porcentaje": round(efectivo_pct, 1),
            "tarjeta_tickets": tarjeta_count,
            "efectivo_tickets": efectivo_count
        },
        "origen_pedidos": {
            "expo_pedidos": expo_orders,
            "expo_porcentaje": expo_pct,
            "caja_pedidos": caja_orders,
            "caja_porcentaje": caja_pct
        },
        "bloques": bloques
    }
