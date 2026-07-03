from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/personal')
def personal():
    return render_template('personal.html')

# Rutas pendientes (las agregamos después)
@app.route('/inventario')
def inventario():
    return "<h1>Inventario - Próximamente</h1>"

@app.route('/pedidos')
def pedidos():
    return "<h1>Pedidos - Próximamente</h1>"

@app.route('/estadisticas')
def estadisticas():
    return "<h1>Estadísticas - Próximamente</h1>"

if __name__ == '__main__':
    app.run(debug=True, port=5000)