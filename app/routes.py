import os
import json
from flask import render_template, request, jsonify, send_from_directory
from flask import current_app as app
from .utils import agregar_apartado_a_json, eliminar_apartado_de_json

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

@app.route('/api/config/apartados/listar', methods=['GET'])
def listar_apartados():
    """Devuelve la lista actual de apartados desde el archivo"""
    try:
        ruta_json = os.path.join(app.root_path, 'static/data/dispositivos.json')

        with open(ruta_json, 'r', encoding='utf-8') as f:
            data = json.load(f)

        response = jsonify({
            "estado": "exito",
            "apartados": data['configuracion']['apartados']
        })

        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'

        return response, 200

    except Exception as e:
        return jsonify({
            "estado": "error",
            "mensaje": str(e)
        }), 500

@app.route('/api/config/apartados', methods=['POST'])
def guardar_apartado():
    datos = request.get_json()

    nombre = datos.get('nombre_apartado')
    valor = datos.get('valor_predeterminado')

    if not nombre or not valor:
        return jsonify({
            "estado": "error",
            "mensaje": "Datos incompletos"
        }), 400

    try:
        agregar_apartado_a_json(nombre, valor)

        return jsonify({
            "estado": "exito",
            "mensaje": "Apartado guardado correctamente"
        }), 200

    except Exception as e:
        return jsonify({
            "estado": "error",
            "mensaje": str(e)
        }), 500
    
@app.route('/api/config/apartados/eliminar', methods=['POST'])
def borrar_apartado():
    datos = request.get_json()

    nombre = datos.get('nombre_apartado')

    try:
        eliminar_apartado_de_json(nombre)

        return jsonify({
            "estado": "exito",
            "mensaje": f"Apartado {nombre} eliminado correctamente"
        }), 200

    except ValueError as e:
        return jsonify({
            "estado": "error",
            "mensaje": str(e)
        }), 400

    except Exception as e:
        return jsonify({
            "estado": "error",
            "mensaje": str(e)
        }), 500


"""
==========================================================================
ENDPOINTS DE API PARA GESTIÓN DE DISPOSITIVOS (PUNTOS)
==========================================================================
"""

@app.route('/api/dispositivos/listar', methods=['GET'])
def listar_dispositivos():
    """Devuelve la lista de todos los dispositivos"""
    try:
        ruta_json = os.path.join(app.root_path, 'static/data/dispositivos.json')

        with open(ruta_json, 'r', encoding='utf-8') as f:
            data = json.load(f)

        response = jsonify({
            "estado": "exito",
            "dispositivos": data.get('dispositivos', [])
        })

        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'

        return response, 200

    except Exception as e:
        return jsonify({
            "estado": "error",
            "mensaje": str(e)
        }), 500


@app.route('/api/dispositivos/agregar', methods=['POST'])
def agregar_dispositivo():
    """Agrega un nuevo dispositivo/punto al plano en el centro (50%, 50%)"""

    datos = request.get_json()
    detalles = datos.get('detalles', {})

    if not detalles:
        return jsonify({
            "estado": "error",
            "mensaje": "Se requieren 'detalles' para el dispositivo"
        }), 400

    x = "50%"
    y = "50%"

    try:
        from .utils import agregar_dispositivo_a_json

        nuevo_dispositivo = agregar_dispositivo_a_json(x, y, detalles)

        return jsonify({
            "estado": "exito",
            "mensaje": f"Dispositivo {nuevo_dispositivo['id']} agregado correctamente",
            "dispositivo": nuevo_dispositivo
        }), 200

    except ValueError as e:
        return jsonify({
            "estado": "error",
            "mensaje": str(e)
        }), 400

    except Exception as e:
        return jsonify({
            "estado": "error",
            "mensaje": str(e)
        }), 500