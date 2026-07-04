from pydantic import BaseModel
from decimal import Decimal

class DashboardMetrics(BaseModel):
    sales_today: Decimal
    active_orders_count: int
    total_products: int
    total_users: int

class KitchenNotification(BaseModel):
    title: str
    message: str
    time: str
