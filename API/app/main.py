from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .data.database import engine, Base
from .routers import auth, colaboradores, productos, mesas, pedidos, ventas, estadisticas
from .data.seed import seed_database

# Crear las tablas relacionales al iniciar la API si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Coffee-Code Backend API",
    description="Ecosistema de Servicios Centralizados de Coffee-Code para Web y Móvil",
    version="1.0.0"
)

# Configurar middleware de CORS para permitir peticiones del Frontend Web y Móvil
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los enrutadores analíticos y operativos
app.include_router(auth.router)
app.include_router(colaboradores.router)
app.include_router(productos.router)
app.include_router(mesas.router)
app.include_router(pedidos.router)
app.include_router(ventas.router)
app.include_router(estadisticas.router)

@app.on_event("startup")
def startup_populate():
    # Poblar la base de datos con los datos semilla del primer parcial al arrancar
    seed_database()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Coffee-Code API Engine",
        "docs": "/docs"
    }
