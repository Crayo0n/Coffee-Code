from sqlalchemy.orm import Session
from .database import SessionLocal
from .. import models, security

def seed_database():
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
                {"name": "Espresso Intenso", "price": 40.00, "category_id": bebida_caliente.id, "status_id": disp.id, "photo": "https://images.unsplash.com/photo-1510972527409-cef5e0be306b?w=150&auto=format&fit=crop&q=80"},
                {"name": "Capuchino Italiano", "price": 55.00, "category_id": bebida_caliente.id, "status_id": disp.id, "photo": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=150&auto=format&fit=crop&q=80"},
                {"name": "Espresso Frío Cream", "price": 50.00, "category_id": bebida_fria.id, "status_id": disp.id, "photo": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=150&auto=format&fit=crop&q=80"},
                {"name": "Macarrón de Café", "price": 25.00, "category_id": reposteria.id, "status_id": disp.id, "photo": "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=150&auto=format&fit=crop&q=80"},
                {"name": "Muffin de Vainilla", "price": 35.00, "category_id": reposteria.id, "status_id": nodisp.id, "photo": "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=150&auto=format&fit=crop&q=80"}
            ]
            for prod_data in productos_seed:
                db.add(models.Producto(
                    name=prod_data["name"],
                    price=prod_data["price"],
                    category_id=prod_data["category_id"],
                    status_id=prod_data["status_id"],
                    photo=prod_data["photo"]
                ))
            db.commit()

    finally:
        db.close()
