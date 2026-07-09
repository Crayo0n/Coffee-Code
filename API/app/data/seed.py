from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import SessionLocal, engine
from .. import models, security

def seed_database():
    # Aplicar migraciones manuales en caso de bases de datos pre-existentes
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 50;"))
            conn.execute(text("ALTER TABLE productos ADD COLUMN IF NOT EXISTS description VARCHAR(255);"))
            conn.commit()
    except Exception as e:
        print(f"Migraciones ignoradas o fallidas: {e}")

    db = SessionLocal()
    try:
        # 1. Poblar Roles si está vacío
        if db.query(models.Role).count() == 0:
            for role_name in ["ADMINISTRADOR", "COCINA", "CAJA", "MESERO"]:
                db.add(models.Role(name=role_name))
            db.commit()

        # 2. Poblar Estados de Productos si está vacío
        if db.query(models.EstadoProducto).count() == 0:
            db.add(models.EstadoProducto(name="disponible"))
            db.add(models.EstadoProducto(name="no_disponible"))
            db.commit()

        # 3. Poblar Categorías si está vacío
        if db.query(models.Categoria).count() == 0:
            for cat_name in ["BEBIDA_CALIENTE", "BEBIDA_FRIA", "REPOSTERIA", "OTROS"]:
                db.add(models.Categoria(name=cat_name))
            db.commit()

        # 4. Poblar Colaboradores si está vacío
        if db.query(models.Colaborador).count() == 0:
            default_hashed_pwd = security.get_password_hash("123")
            colaboradores_seed = [
                {"name": "Mauricio Rodríguez Molina", "email": "mau@coffeecode.com", "role": "ADMINISTRADOR", "shift": "MATUTINO", "status": "activo"},
                {"name": "Mauricio Rodríguez Molina", "email": "mau.cocina@coffeecode.com", "role": "COCINA", "shift": "VESPERTINO", "status": "activo"},
                {"name": "Mauricio Rodríguez Molina", "email": "mau.caja@coffeecode.com", "role": "CAJA", "shift": "MATUTINO", "status": "activo"},
                {"name": "Mauricio Rodríguez Molina", "email": "mau.mesero@coffeecode.com", "role": "MESERO", "shift": "VESPERTINO", "status": "activo"},
                {"name": "Mauricio Rodríguez Molina", "email": "mau.cocina2@coffeecode.com", "role": "COCINA", "shift": "NOCTURNO", "status": "activo"},
                {"name": "Mauricio Rodríguez Molina", "email": "mau.mesero2@coffeecode.com", "role": "MESERO", "shift": "MATUTINO", "status": "activo"},
                {"name": "Mauricio Rodríguez Molina", "email": "mau.caja2@coffeecode.com", "role": "CAJA", "shift": "VESPERTINO", "status": "inactivo"},
                {"name": "Mauricio Rodríguez Molina", "email": "mau.mesero3@coffeecode.com", "role": "MESERO", "shift": "NOCTURNO", "status": "activo"}
            ]
            for user_data in colaboradores_seed:
                db.add(models.Colaborador(
                    name=user_data["name"],
                    email=user_data["email"],
                    role=user_data["role"],
                    shift=user_data["shift"],
                    password=default_hashed_pwd,
                    photo="img/User - Mau.png",
                    status=user_data["status"]
                ))
            db.commit()

        # 5. Poblar Mesas si está vacío
        if db.query(models.Mesa).count() == 0:
            for num in [1, 2, 3, 4, 5]:
                db.add(models.Mesa(number=num, status="available"))
            db.commit()

        # 6. Poblar Productos si está vacío
        if db.query(models.Producto).count() == 0:
            bebida_caliente = db.query(models.Categoria).filter(models.Categoria.name == "BEBIDA_CALIENTE").first()
            bebida_fria = db.query(models.Categoria).filter(models.Categoria.name == "BEBIDA_FRIA").first()
            reposteria = db.query(models.Categoria).filter(models.Categoria.name == "REPOSTERIA").first()
            
            disp = db.query(models.EstadoProducto).filter(models.EstadoProducto.name == "disponible").first()
            nodisp = db.query(models.EstadoProducto).filter(models.EstadoProducto.name == "no_disponible").first()
            
            productos_seed = [
                {"name": "Espresso Intenso", "price": 40.00, "category_id": bebida_caliente.id, "status_id": disp.id, "photo": "espresso_intenso.png", "description": "Extracción doble"},
                {"name": "Latte Vainilla", "price": 55.00, "category_id": bebida_caliente.id, "status_id": disp.id, "photo": "latte_vainilla.png", "description": "Con leche entera"},
                {"name": "Café Americano", "price": 40.00, "category_id": bebida_caliente.id, "status_id": disp.id, "photo": "cafe_americano.png", "description": "Extra oscuro"},
                {"name": "Frappé Moka", "price": 65.00, "category_id": bebida_fria.id, "status_id": disp.id, "photo": "frappe_moka.png", "description": "Sin crema batida"},
                {"name": "Croissant", "price": 45.00, "category_id": reposteria.id, "status_id": disp.id, "photo": "croissant.png", "description": "Mantequilla pura"}
            ]
            for prod_data in productos_seed:
                db.add(models.Producto(
                    name=prod_data["name"],
                    price=prod_data["price"],
                    category_id=prod_data["category_id"],
                    status_id=prod_data["status_id"],
                    photo=prod_data["photo"],
                    description=prod_data["description"]
                ))
            db.commit()

    finally:
        db.close()
