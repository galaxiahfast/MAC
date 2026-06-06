



from flask import request, jsonify, render_template, current_app as aplicacion
from .ayudantes import extraerNombreApartado, manejarErroresRuta, normalizarNombreApartado
from .baseDatos.operacionesSQL import (
    crearApartado,
    eliminarApartado,
    listarApartados,
    editarApartado,
    restaurarApartado,
    eliminarApartadoDefinitivo
)



# @galaxiahfast - Renderiza la vista principal del mapa interactivo.
@aplicacion.route('/')
def index():
    return render_template('index.html')



# @galaxiahfast - Endpoint para registrar un nuevo apartado global.
@aplicacion.route('/api/apartados/crear', methods=['POST'])
@manejarErroresRuta
def peticionCrearApartado():

    datos = request.get_json() or {}
    nombreApartado = datos.get('nombreApartado', '')
    valorPredeterminado = datos.get('valorPredeterminado', '')

    # @galaxiahfast - Valida la presencia obligatoria del nombre técnico.
    if not nombreApartado:
        return jsonify({
            'estado': 'error',
            'mensaje': 'Nombre obligatorio'
        }), 400

    nombreApartado = normalizarNombreApartado(nombreApartado)

    # @galaxiahfast - Guarda el apartado en el catálogo maestro y crea sus relaciones globales.
    crearApartado(nombreApartado, valorPredeterminado)

    return jsonify({'estado': 'exito'}), 200



# @galaxiahfast - Endpoint para el borrado lógico de un apartado existente.
@aplicacion.route('/api/apartados/eliminar', methods=['POST'])
@manejarErroresRuta
def peticionEliminarApartado():

    nombreApartado, datos = extraerNombreApartado()
    if not nombreApartado:
        return jsonify({'estado': 'error'}), 400

    eliminarApartado(nombreApartado)

    return jsonify({'estado': 'exito'}), 200



# @galaxiahfast - Endpoint para consultar el catálogo de apartados activos.
@aplicacion.route('/api/apartados/listar', methods=['GET'])
@manejarErroresRuta
def peticionListarApartados():

    return jsonify({
        'estado': 'exito',
        'apartados': listarApartados()
    }), 200



# @galaxiahfast - Endpoint para modificar los datos estructurales de un apartado.
@aplicacion.route('/api/apartados/editar', methods=['POST'])
@manejarErroresRuta
def peticionEditarApartado():

    datos = request.get_json() or {}
    idApartado = datos.get('idApartado')
    nombreApartado = datos.get('nombreApartado')
    valorPredeterminado = datos.get('valorPredeterminado')

    # @galaxiahfast - Valida la presencia obligatoria del identificador numérico de registro.
    if not idApartado:
        return jsonify({'estado': 'error'}), 400

    editarApartado(idApartado, nombreApartado, valorPredeterminado)

    return jsonify({'estado': 'exito'}), 200



# @galaxiahfast - Endpoint para revertir la baja lógica de un apartado.
@aplicacion.route('/api/apartados/restaurar', methods=['POST'])
@manejarErroresRuta
def peticionRestaurarApartado():

    nombreApartado, datos = extraerNombreApartado()
    if not nombreApartado:
        return jsonify({'estado': 'error'}), 400

    restaurarApartado(nombreApartado)

    return jsonify({
        'estado': 'exito',
        'mensaje': 'Apartado restaurado correctamente.'
    }), 200



# @galaxiahfast - Endpoint para purgar de forma permanente un registro del sistema.
@aplicacion.route('/api/apartados/eliminar-definitivo', methods=['POST'])
@manejarErroresRuta
def peticionEliminarApartadoDefinitivo():

    nombreApartado, datos = extraerNombreApartado()
    if not nombreApartado:
        return jsonify({'estado': 'error'}), 400

    eliminarApartadoDefinitivo(nombreApartado)

    return jsonify({
        'estado': 'exito',
        'mensaje': 'Apartado eliminado definitivamente.'
    }), 200
