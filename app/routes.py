import os
from flask import render_template, request, jsonify, send_from_directory
from flask import current_app as app
from .utils import agregar_apartado_a_json, eliminar_apartado_de_json

"""
==========================================================================
DEFINICIÓN DE RUTAS Y LÓGICA DE VISTAS
==========================================================================
"""
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(
        os.path.join(app.root_path, 'static'),
        'favicon.ico', 
        mimetype='image/vnd.microsoft.icon'
    )

@app.route('/robots.txt')
def robots():
    return "User-agent: *\nDisallow:", 200, {'Content-Type': 'text/plain'}

"""
==========================================================================
ENDPOINTS DE API PARA CONFIGURACIÓN
==========================================================================
"""
@app.route('/api/config/apartados', methods=['POST'])
def guardar_apartado():
    datos = request.get_json()
    nombre = datos.get('nombre_apartado')
    valor = datos.get('valor_predeterminado')
    
    if not nombre or not valor:
        return jsonify({"status": "error", "message": "Datos incompletos"}), 400
        
    try:
        agregar_apartado_a_json(nombre, valor)
        return jsonify({"status": "success", "message": "JSON actualizado correctamente"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route('/api/config/apartados/eliminar', methods=['POST'])
def borrar_apartado():
    datos = request.get_json()
    nombre = datos.get('nombre_apartado')
    
    try:
        eliminar_apartado_de_json(nombre)
        return jsonify({"status": "success", "message": f"Apartado {nombre} eliminado"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500