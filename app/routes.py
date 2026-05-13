from flask import render_template
from flask import current_app as app

# ==========================================================================
# DEFINICIÓN DE RUTAS Y LÓGICA DE VISTAS
# ==========================================================================
@app.route('/')
def index():
    return render_template('index.html')