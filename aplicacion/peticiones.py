



from flask import request, jsonify, render_template, current_app as aplicacion
from .ayudantes import normalizarNombreApartado
from .baseDatos.operacionesSQL import (
    crearApartado,
    eliminarApartado,
    listarApartados,
    editarApartado,
    restaurarApartado,
    eliminarApartadoDefinitivo
)

LIMITE_NOMBRE = 100
LIMITE_VALOR = 500


def _respuestaErrorInterno(error):
    if isinstance(error, ValueError):
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 400
    aplicacion.logger.exception('Error interno en petición')
    return jsonify({'estado': 'error', 'mensaje': 'Error interno del servidor.'}), 500


def _validarCadena(valor, limite):
    return isinstance(valor, str) and len(valor) <= limite



# @galaxiahfast - Renderiza la vista principal del mapa interactivo.
@aplicacion.route('/')
def index():
    return render_template('index.html')



# @galaxiahfast - Endpoint para registrar un nuevo apartado global.
@aplicacion.route('/api/apartados/crear', methods=['POST'])
def peticionCrearApartado():

    # @galaxiahfast - Gestiona la captura, validación y persistencia del nuevo registro.
    try:

        # @galaxiahfast - Obtiene el cuerpo JSON de la petición o un diccionario vacío por defecto.
        datos = request.get_json() or {}

        # @galaxiahfast - Extrae los parámetros enviados desde el frontend.
        nombreApartado = datos.get('nombreApartado', '')
        valorPredeterminado = datos.get('valorPredeterminado', '')

        # @galaxiahfast - Valida la presencia obligatoria del nombre técnico.
        if not nombreApartado:
            return jsonify({
                'estado': 'error',
                'mensaje': 'Nombre obligatorio'
            }), 400

        if not _validarCadena(nombreApartado, LIMITE_NOMBRE) or not _validarCadena(valorPredeterminado, LIMITE_VALOR):
            return jsonify({'estado': 'error', 'mensaje': 'Datos de entrada inválidos.'}), 400

        # @galaxiahfast - Normaliza el nombre del apartado para asegurar consistencia interna.
        nombreApartado = normalizarNombreApartado(nombreApartado)

        # @galaxiahfast - Guarda el apartado en el catálogo maestro y crea sus relaciones globales.
        crearApartado(nombreApartado, valorPredeterminado)

        # @galaxiahfast - Retorna confirmación de operación exitosa.
        return jsonify({
            'estado': 'exito'
        }), 200

    # @galaxiahfast - Captura fallos imprevistos y devuelve un código de error interno.
    except Exception as error:
        return _respuestaErrorInterno(error)



# @galaxiahfast - Endpoint para el borrado lógico de un apartado existente.
@aplicacion.route('/api/apartados/eliminar', methods=['POST'])
def peticionEliminarApartado():

    # @galaxiahfast - Controla la baja lógica y la validación de parámetros de entrada.
    try:

        # @galaxiahfast - Extrae el identificador de texto del cuerpo de la solicitud.
        datos = request.get_json() or {}
        nombreApartado = datos.get('nombreApartado', '')

        # @galaxiahfast - Valida que el nombre no sea una cadena vacía.
        if not nombreApartado:
            return jsonify({'estado': 'error'}), 400

        if not _validarCadena(nombreApartado, LIMITE_NOMBRE):
            return jsonify({'estado': 'error', 'mensaje': 'Datos de entrada inválidos.'}), 400

        # @galaxiahfast - Procesa el nombre para realizar la coincidencia exacta en base de datos.
        nombreApartado = normalizarNombreApartado(nombreApartado)

        # @galaxiahfast - Cambia el estado del apartado para enviarlo a la papelera.
        eliminarApartado(nombreApartado)

        # @galaxiahfast - Retorna estado de éxito.
        return jsonify({'estado': 'exito'}), 200

    # @galaxiahfast - Devuelve el error capturado estructurado en formato JSON.
    except Exception as error:
        return _respuestaErrorInterno(error)



# @galaxiahfast - Endpoint para consultar el catálogo de apartados activos.
@aplicacion.route('/api/apartados/listar', methods=['GET'])
def peticionListarApartados():

    # @galaxiahfast - Controla la lectura de registros de la base de datos.
    try:

        # @galaxiahfast - Consulta la capa SQL y serializa la colección de registros activos.
        return jsonify({
            'estado': 'exito',
            'apartados': listarApartados()
        }), 200

    # @galaxiahfast - Captura anomalías imprevistas del servidor durante la lectura.
    except Exception as error:
        return _respuestaErrorInterno(error)



# @galaxiahfast - Endpoint para modificar los datos estructurales de un apartado.
@aplicacion.route('/api/apartados/editar', methods=['POST'])
def peticionEditarApartado():

    # @galaxiahfast - Gestiona la actualización y la propagación condicional de valores.
    try:

        # @galaxiahfast - Extrae los parámetros estructurales del cuerpo de la petición.
        datos = request.get_json() or {}
        idApartado = datos.get('idApartado')
        nombreApartado = datos.get('nombreApartado')
        valorPredeterminado = datos.get('valorPredeterminado')

        # @galaxiahfast - Valida la presencia obligatoria del identificador numérico de registro.
        if not idApartado:
            return jsonify({'estado': 'error'}), 400

        try:
            idApartado = int(idApartado)
        except (TypeError, ValueError):
            return jsonify({'estado': 'error', 'mensaje': 'ID inválido.'}), 400

        if nombreApartado is not None and not _validarCadena(nombreApartado, LIMITE_NOMBRE):
            return jsonify({'estado': 'error', 'mensaje': 'Datos de entrada inválidos.'}), 400

        if valorPredeterminado is not None and not _validarCadena(valorPredeterminado, LIMITE_VALOR):
            return jsonify({'estado': 'error', 'mensaje': 'Datos de entrada inválidos.'}), 400

        # @galaxiahfast - Modifica los metadatos del apartado y actualiza los dispositivos heredados.
        editarApartado(idApartado, nombreApartado, valorPredeterminado)

        # @galaxiahfast - Retorna confirmación de actualización exitosa.
        return jsonify({'estado': 'exito'}), 200

    # @galaxiahfast - Procesa errores críticos devolviendo la descripción de la falla.
    except Exception as error:
        return _respuestaErrorInterno(error)



# @galaxiahfast - Endpoint para revertir la baja lógica de un apartado.
@aplicacion.route('/api/apartados/restaurar', methods=['POST'])
def peticionRestaurarApartado():

    # @galaxiahfast - Controla la recuperación del registro y de sus valores por defecto.
    try:

        # @galaxiahfast - Obtiene los datos del cuerpo de la solicitud HTTP.
        datos = request.get_json() or {}
        nombreApartado = datos.get('nombreApartado', '')

        # @galaxiahfast - Verifica que se haya enviado el nombre objetivo.
        if not nombreApartado:
            return jsonify({'estado': 'error'}), 400

        if not _validarCadena(nombreApartado, LIMITE_NOMBRE):
            return jsonify({'estado': 'error', 'mensaje': 'Datos de entrada inválidos.'}), 400

        # @galaxiahfast - Estandariza la cadena antes de consultar la persistencia.
        nombreApartado = normalizarNombreApartado(nombreApartado)

        # @galaxiahfast - Activa el apartado y restaura los valores en dispositivos no personalizados.
        restaurarApartado(nombreApartado)

        # @galaxiahfast - Retorna respuesta estructurada con mensaje personalizado de éxito.
        return jsonify({
            'estado': 'exito',
            'mensaje': 'Apartado restaurado correctamente.'
        }), 200

    # @galaxiahfast - Captura excepciones de base de datos o lógica empresarial.
    except Exception as error:
        return _respuestaErrorInterno(error)



# @galaxiahfast - Endpoint para purgar de forma permanente un registro del sistema.
@aplicacion.route('/api/apartados/eliminar-definitivo', methods=['POST'])
def peticionEliminarApartadoDefinitivo():

    # @galaxiahfast - Controla la eliminación física y la limpieza manual en cascada.
    try:

        # @galaxiahfast - Recupera la información de entrada desde el cliente.
        datos = request.get_json() or {}
        nombreApartado = datos.get('nombreApartado', '')

        # @galaxiahfast - Valida la presencia del campo obligatorio para prevenir ejecuciones vacías.
        if not nombreApartado:
            return jsonify({'estado': 'error'}), 400

        if not _validarCadena(nombreApartado, LIMITE_NOMBRE):
            return jsonify({'estado': 'error', 'mensaje': 'Datos de entrada inválidos.'}), 400

        # @galaxiahfast - Aplica reglas de formateo técnico sobre el nombre recibido.
        nombreApartado = normalizarNombreApartado(nombreApartado)

        # @galaxiahfast - Remueve permanentemente las dependencias y el registro maestro.
        eliminarApartadoDefinitivo(nombreApartado)

        # @galaxiahfast - Retorna confirmación de borrado físico irreversible.
        return jsonify({
            'estado': 'exito',
            'mensaje': 'Apartado eliminado definitivamente.'
        }), 200

    # @galaxiahfast - Atrapa errores críticos de integridad o infraestructura.
    except Exception as error:
        return _respuestaErrorInterno(error)
