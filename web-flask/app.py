from flask import Flask, render_template, request, redirect, url_for, session, flash
import requests
from functools import wraps

app = Flask(__name__)
app.secret_key = "coffeecode_premium_secret_session_key"
app.config['MAX_CONTENT_LENGTH'] = 8 * 1024 * 1024  # 8 MB límite máximo de subida

import os
API_URL = os.environ.get("API_URL", "http://localhost:8000/api")

# Manejo de error por payload demasiado grande (imagen o formulario > 8MB)
@app.errorhandler(413)
def request_entity_too_large(error):
    flash("⚠️ La imagen es demasiado grande. Por favor selecciona una imagen más pequeña (máx. 8 MB).")
    return redirect(request.referrer or url_for('personal'))

# Decorador para proteger rutas
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'token' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


# --- RUTA LOGIN (GET & POST) ---
@app.route('/', methods=['GET', 'POST'])
@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'token' in session:
        return redirect(url_for('dashboard'))
        
    error = None
    if request.method == 'POST':
        email = request.form.get('username')
        password = request.form.get('password')
        
        try:
            # Petición OAuth2 a FastAPI
            response = requests.post(
                f"{API_URL}/auth/login",
                data={"username": email, "password": password}
            )
            
            if response.status_code == 200:
                token_data = response.json()
                token = token_data['access_token']
                
                # Obtener perfil del usuario logueado para validar rol
                profile_resp = requests.get(
                    f"{API_URL}/colaboradores/me/profile",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if profile_resp.status_code == 200:
                    profile = profile_resp.json()
                    
                    if profile.get('role') == 'ADMINISTRADOR':
                        # Guardar sesión en cookies de Flask
                        profile['initials'] = ''.join([n[0] for n in profile.get('name', '').split() if n][:2]).upper() if profile.get('name') else 'CC'
                        session['token'] = token
                        session['user'] = profile
                        return redirect(url_for('dashboard'))
                    else:
                        error = "Acceso restringido: Solo Administradores tienen acceso a este panel."
                else:
                    error = "Error al recuperar el perfil del colaborador."
            else:
                error = "Correo electrónico o contraseña incorrectos."
        except requests.exceptions.RequestException:
            error = "No se pudo conectar con el servidor de la API."
            
    return render_template('login.html', error=error)

# --- RUTA LOGOUT ---
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# --- RUTA DASHBOARD ---
@app.route('/dashboard')
@login_required
def dashboard():
    headers = {"Authorization": f"Bearer {session['token']}"}
    kpis = {"sales_today": 0.0, "active_orders_count": 0, "total_products": 0, "total_users": 0}
    pedidos_activos = []
    
    try:
        kpi_resp = requests.get(f"{API_URL}/estadisticas/dashboard-kpis", headers=headers)
        if kpi_resp.status_code == 200:
            kpis = kpi_resp.json()
            if 'sales_today' in kpis:
                kpis['sales_today'] = float(kpis['sales_today'] or 0.0)
            
        # 2. Obtener comandas activas
        pedidos_resp = requests.get(f"{API_URL}/pedidos", headers=headers)
        if pedidos_resp.status_code == 200:
            all_pedidos = pedidos_resp.json()
            for p in all_pedidos:
                total_price = 0.0
                for d in p.get('detalles', []):
                    prod = d.get('producto')
                    if prod:
                        total_price += d['quantity'] * float(prod['price'])
                p['total_price'] = total_price
            # Filtrar comandas que no están pagadas
            pedidos_activos = [p for p in all_pedidos if p['status'] != 'PAGADO']
            
        # 3. Obtener alertas de cocina
        alertas = []
        alertas_resp = requests.get(f"{API_URL}/alertas?unread_only=true", headers=headers)
        if alertas_resp.status_code == 200:
            alertas = alertas_resp.json()
            
    except requests.exceptions.RequestException as e:
        print("Error de conexión a la API:", e)
        
    return render_template('dashboard.html', active_page='dashboard', kpis=kpis, pedidos=pedidos_activos, alertas=alertas)

# --- RUTA PERSONAL (CRUD) ---
@app.route('/personal')
@login_required
def personal():
    headers = {"Authorization": f"Bearer {session['token']}"}
    users = []
    try:
        response = requests.get(f"{API_URL}/colaboradores", headers=headers)
        if response.status_code == 200:
            users = response.json()
    except requests.exceptions.RequestException as e:
        print("Error de conexión a la API:", e)
        
    return render_template('personal.html', active_page='personal', users=users)

@app.route('/personal/crear', methods=['POST'])
@login_required
def crear_colaborador():
    headers = {"Authorization": f"Bearer {session['token']}"}
    name = request.form.get('name')
    email = request.form.get('email')
    password = request.form.get('password')
    role = request.form.get('role')
    shift = request.form.get('shift')
    photo = request.form.get('photo') or None
    
    try:
        payload = {
            "name": name,
            "email": email,
            "password": password,
            "role": role,
            "shift": shift,
            "photo": photo,
            "status": "activo"
        }
        resp = requests.post(f"{API_URL}/colaboradores", json=payload, headers=headers)
        if resp.status_code == 201:
            flash(f" Colaborador '{name}' creado exitosamente.", 'success')
        else:
            flash(f"Error al crear colaborador: {resp.json().get('detail', 'Error desconocido')}", 'error')
    except requests.exceptions.RequestException as e:
        flash("Error de conexión con el servidor.", 'error')
        
    return redirect(url_for('personal'))

@app.route('/personal/editar/<int:id>', methods=['POST'])
@login_required
def editar_colaborador(id):
    headers = {"Authorization": f"Bearer {session['token']}"}
    name = request.form.get('name')
    email = request.form.get('email')
    password = request.form.get('password')
    role = request.form.get('role')
    shift = request.form.get('shift')
    photo = request.form.get('photo') or None
    
    payload = {
        "name": name,
        "email": email,
        "role": role,
        "shift": shift,
        "photo": photo
    }
    if password:
        payload["password"] = password
        
    try:
        resp = requests.put(f"{API_URL}/colaboradores/{id}", json=payload, headers=headers)
        if resp.status_code == 200:
            flash(f" Colaborador '{name}' actualizado exitosamente.", 'success')
        else:
            flash(f"Error al actualizar colaborador: {resp.json().get('detail', 'Error desconocido')}", 'error')
    except requests.exceptions.RequestException as e:
        flash("Error de conexión con el servidor.", 'error')
        
    return redirect(url_for('personal'))

@app.route('/personal/eliminar/<int:id>', methods=['POST', 'GET'])
@login_required
def eliminar_colaborador(id):
    headers = {"Authorization": f"Bearer {session['token']}"}
    try:
        resp = requests.delete(f"{API_URL}/colaboradores/{id}", headers=headers)
        if resp.status_code == 200:
            flash(" Colaborador eliminado exitosamente.", 'success')
        else:
            flash("Error al eliminar el colaborador.", 'error')
    except requests.exceptions.RequestException as e:
        flash("Error de conexión con el servidor.", 'error')
        
    return redirect(url_for('personal'))

# --- RUTA INVENTARIO (CRUD) ---
@app.route('/inventario')
@login_required
def inventario():
    headers = {"Authorization": f"Bearer {session['token']}"}
    products = []
    categories = []
    try:
        prod_resp = requests.get(f"{API_URL}/productos", headers=headers)
        if prod_resp.status_code == 200:
            products = prod_resp.json()
            for p in products:
                if 'price' in p:
                    p['price'] = float(p['price'] or 0.0)
            
        # Cargar categorías para selectores
        cat_resp = requests.get(f"{API_URL}/categorias", headers=headers)
        if cat_resp.status_code == 200:
            categories = cat_resp.json()
    except requests.exceptions.RequestException as e:
        print("Error de conexión a la API:", e)
        
    return render_template('inventario.html', active_page='inventario', products=products, categories=categories)

@app.route('/inventario/crear', methods=['POST'])
@login_required
def crear_producto():
    headers = {"Authorization": f"Bearer {session['token']}"}
    name = request.form.get('name')
    price = float(request.form.get('price', 0))
    category_id = int(request.form.get('category_id', 0))
    status_id = int(request.form.get('status_id', 1))
    photo = request.form.get('photo') or None
    
    try:
        payload = {
            "name": name,
            "price": price,
            "category_id": category_id,
            "status_id": status_id,
            "photo": photo
        }
        resp = requests.post(f"{API_URL}/productos", json=payload, headers=headers)
        if resp.status_code == 201:
            flash(f" Producto '{name}' agregado al catálogo exitosamente.", 'success')
        else:
            flash(f"Error al crear producto: {resp.json().get('detail', 'Error desconocido')}", 'error')
    except requests.exceptions.RequestException as e:
        flash("Error de conexión con el servidor.", 'error')
        
    return redirect(url_for('inventario'))

@app.route('/inventario/editar/<int:id>', methods=['POST'])
@login_required
def editar_producto(id):
    headers = {"Authorization": f"Bearer {session['token']}"}
    name = request.form.get('name')
    price = request.form.get('price')
    category_id = request.form.get('category_id')
    status_id = request.form.get('status_id')
    photo = request.form.get('photo') or None

    payload = {}
    if name: payload["name"] = name
    if price: payload["price"] = float(price)
    if category_id: payload["category_id"] = int(category_id)
    if status_id: payload["status_id"] = int(status_id)
    if photo: payload["photo"] = photo

    try:
        resp = requests.put(f"{API_URL}/productos/{id}", json=payload, headers=headers)
        if resp.status_code == 200:
            flash(f" Producto '{name}' actualizado exitosamente.", 'success')
        else:
            flash(f"Error al actualizar producto: {resp.json().get('detail', 'Error desconocido')}", 'error')
    except requests.exceptions.RequestException as e:
        flash("Error de conexión con el servidor.", 'error')

    return redirect(url_for('inventario'))

@app.route('/categorias/crear', methods=['POST'])
@login_required
def crear_categoria():
    headers = {"Authorization": f"Bearer {session['token']}"}
    name = request.form.get('name', '').strip()
    if not name:
        flash("El nombre de la categoría no puede estar vacío.", 'error')
        return redirect(url_for('inventario'))
    try:
        resp = requests.post(f"{API_URL}/categorias", json={"name": name}, headers=headers)
        if resp.status_code in (200, 201):
            flash(f" Categoría '{name}' creada exitosamente.", 'success')
        else:
            flash(f"Error al crear categoría: {resp.json().get('detail', 'Error desconocido')}", 'error')
    except requests.exceptions.RequestException as e:
        flash("Error de conexión con el servidor.", 'error')
    return redirect(url_for('inventario'))

@app.route('/categorias/eliminar/<int:id>', methods=['GET', 'POST'])
@login_required
def eliminar_categoria(id):
    headers = {"Authorization": f"Bearer {session['token']}"}
    try:
        resp = requests.delete(f"{API_URL}/categorias/{id}", headers=headers)
        if resp.status_code in (200, 204):
            flash(" Categoría eliminada exitosamente.", 'success')
        else:
            flash("No se pudo eliminar la categoría.", 'error')
    except requests.exceptions.RequestException as e:
        flash("Error de conexión con el servidor.", 'error')
    return redirect(url_for('inventario'))

# --- RUTA MESAS (CRUD) ---
@app.route('/mesas')
@login_required
def mesas():
    headers = {"Authorization": f"Bearer {session['token']}"}
    mesas = []
    try:
        response = requests.get(f"{API_URL}/mesas", headers=headers)
        if response.status_code == 200:
            mesas = response.json()
    except requests.exceptions.RequestException as e:
        print("Error de conexión a la API:", e)
        
    return render_template('mesas.html', active_page='mesas', mesas=mesas)

@app.route('/mesas/crear', methods=['POST'])
@login_required
def crear_mesa():
    headers = {"Authorization": f"Bearer {session['token']}"}
    number = int(request.form.get('number', 0))
    status = request.form.get('status', 'Libre')
    
    try:
        payload = {"number": number, "status": status}
        resp = requests.post(f"{API_URL}/mesas", json=payload, headers=headers)
        if resp.status_code == 201:
            flash(f" Mesa {number} agregada exitosamente.", 'success')
        else:
            flash(f"Error al agregar mesa: {resp.json().get('detail', 'Error desconocido')}", 'error')
    except requests.exceptions.RequestException as e:
        flash("Error de conexión con el servidor.", 'error')
        
    return redirect(url_for('mesas'))

@app.route('/mesas/eliminar/<int:id>', methods=['POST', 'GET'])
@login_required
def eliminar_mesa(id):
    headers = {"Authorization": f"Bearer {session['token']}"}
    try:
        resp = requests.delete(f"{API_URL}/mesas/{id}", headers=headers)
        if resp.status_code == 200:
            flash(" Mesa eliminada exitosamente.", 'success')
        else:
            flash("Error al eliminar la mesa.", 'error')
    except requests.exceptions.RequestException as e:
        flash("Error de conexión con el servidor.", 'error')
        
    return redirect(url_for('mesas'))

@app.route('/inventario/eliminar/<int:id>', methods=['POST', 'GET'])
@login_required
def eliminar_producto(id):
    headers = {"Authorization": f"Bearer {session['token']}"}
    try:
        resp = requests.delete(f"{API_URL}/productos/{id}", headers=headers)
        if resp.status_code == 200:
            flash(" Producto eliminado del catálogo exitosamente.", 'success')
        else:
            flash("Error al eliminar el producto.", 'error')
    except requests.exceptions.RequestException as e:
        flash("Error de conexión con el servidor.", 'error')
        
    return redirect(url_for('inventario'))

# --- RUTA ESTADÍSTICAS (REPORTES) ---
@app.route('/estadisticas')
@login_required
def estadisticas():
    headers = {"Authorization": f"Bearer {session['token']}"}
    reporte_financiero = {
        'ventas_brutas': 0.0, 'costo_insumos': 0.0, 'gasto_operativo': 0.0, 'utilidad_neta': 0.0, 'porcentaje_neto': 0.0,
        'semanas': [], 'historico': []
    }
    reporte_productos = []
    reporte_flujo = {
        'metodos_pago': {'tarjeta_porcentaje': 0, 'efectivo_porcentaje': 0, 'tarjeta_tickets': 0, 'efectivo_tickets': 0},
        'origen_pedidos': {'expo_pedidos': 0, 'expo_porcentaje': 0, 'caja_pedidos': 0, 'caja_porcentaje': 0},
        'bloques': []
    }
    
    periodo_filtro = request.args.get('periodo', 'ESTEMES')
    api_params = {"periodo": periodo_filtro}
    
    try:
        # 1. Reporte financiero (Libro Auxiliar)
        fin_resp = requests.get(f"{API_URL}/estadisticas/reporte-financiero", headers=headers, params=api_params)
        if fin_resp.status_code == 200:
            reporte_financiero = fin_resp.json()
            for key in ['ventas_brutas', 'costo_insumos', 'gasto_operativo', 'utilidad_neta']:
                if key in reporte_financiero:
                    reporte_financiero[key] = float(reporte_financiero[key] or 0.0)
            if 'semanas' in reporte_financiero:
                for s in reporte_financiero['semanas']:
                    for key in ['ventas_brutas', 'costo_insumos', 'gasto_operativo', 'utilidad_neta']:
                        if key in s:
                            s[key] = float(s[key] or 0.0)
            if 'historico' in reporte_financiero:
                for h in reporte_financiero['historico']:
                    for key in ['ventas_brutas', 'costo_insumos', 'gasto_operativo', 'utilidad_neta']:
                        if key in h:
                            h[key] = float(h[key] or 0.0)
            
        # 2. Popularidad del catálogo
        prod_resp = requests.get(f"{API_URL}/estadisticas/reporte-productos", headers=headers, params=api_params)
        if prod_resp.status_code == 200:
            reporte_productos = prod_resp.json()
            for p in reporte_productos:
                for key in ['price', 'revenue', 'cost_unit', 'margin_unit']:
                    if key in p:
                        p[key] = float(p[key] or 0.0)
            
        # 3. Flujo horario y métodos de pago
        flujo_resp = requests.get(f"{API_URL}/estadisticas/reporte-flujo", headers=headers, params=api_params)
        if flujo_resp.status_code == 200:
            reporte_flujo = flujo_resp.json()
            if 'bloques' in reporte_flujo:
                for b in reporte_flujo['bloques']:
                    if 'volumen_ventas' in b:
                        b['volumen_ventas'] = float(b['volumen_ventas'] or 0.0)
                    if 'tiempo_prep' in b:
                        try:
                            b['tiempo_prep'] = float(b['tiempo_prep'] or 0.0)
                        except (ValueError, TypeError):
                            pass  # Si es 'N/A' u otro string, mantenerlo como está
            
    except requests.exceptions.RequestException as e:
        print("Error de conexión a la API:", e)
        
    import datetime
    meses_es = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    today = datetime.date.today()
    mes_actual = f"{meses_es[today.month - 1]} {today.year}"
    periodo_actual = f"01 de {meses_es[today.month - 1]} al {today.day:02d} de {meses_es[today.month - 1]} {today.year}"

    return render_template(
        'estadisticas.html',
        active_page='estadisticas',
        finanzas=reporte_financiero,
        productos=reporte_productos,
        flujo=reporte_flujo,
        mes_actual=mes_actual,
        periodo_actual=periodo_actual,
        periodo_filtro=periodo_filtro
    )

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
