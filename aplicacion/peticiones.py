


from flask import request, jsonify, render_template, current_app as aplicacion
from .ayudantes import normalizarNombreApartado
from .baseDatos.operacionesSQL import (
    crearApartado,
    eliminarApartado,
    listarApartados,
    editarApartado,
    restaurarApartado,
    eliminarApartadoDefinitivo,
    listarDispositivos,
    crearDispositivo,
    moverDispositivo,
    ocultarDispositivo,
    eliminarDispositivo,
    restaurarDispositivo,
    eliminarDispositivoDefinitivo,
    listarDispositivosEliminados,
    listarApartadosEliminados,
    actualizarDetalle,
    obtenerDetallesDispositivo
)



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
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 500



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

        # @galaxiahfast - Procesa el nombre para realizar la coincidencia exacta en base de datos.
        nombreApartado = normalizarNombreApartado(nombreApartado)

        # @galaxiahfast - Cambia el estado del apartado para enviarlo a la papelera.
        eliminarApartado(nombreApartado)

        # @galaxiahfast - Retorna estado de éxito.
        return jsonify({'estado': 'exito'}), 200

    # @galaxiahfast - Devuelve el error capturado estructurado en formato JSON.
    except Exception as error:
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 500



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
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 500



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

        # @galaxiahfast - Modifica los metadatos del apartado y actualiza los dispositivos heredados.
        editarApartado(idApartado, nombreApartado, valorPredeterminado)

        # @galaxiahfast - Retorna confirmación de actualización exitosa.
        return jsonify({'estado': 'exito'}), 200

    # @galaxiahfast - Procesa errores críticos devolviendo la descripción de la falla.
    except Exception as error:
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 500



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
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 500



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
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 500



# ==========================================================================
# @galaxiahfast - ENDPOINTS DE DISPOSITIVOS
# ==========================================================================



# @galaxiahfast - Endpoint para consultar la colección de dispositivos activos con sus detalles.
@aplicacion.route('/api/dispositivos/listar', methods=['GET'])
def peticionListarDispositivos():

    # @galaxiahfast - Controla la lectura de registros de la base de datos.
    try:

        # @galaxiahfast - Consulta la capa SQL y serializa la colección de dispositivos activos.
        return jsonify({
            'estado': 'exito',
            'dispositivos': listarDispositivos()
        }), 200

    # @galaxiahfast - Captura anomalías imprevistas del servidor durante la lectura.
    except Exception as error:
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 500



# @galaxiahfast - Endpoint para registrar un nuevo dispositivo en el mapa.
@aplicacion.route('/api/dispositivos/crear', methods=['POST'])
def peticionCrearDispositivo():

    # @galaxiahfast - Gestiona la captura, validación y persistencia del nuevo dispositivo.
    try:

        # @galaxiahfast - Obtiene el cuerpo JSON de la petición o un diccionario vacío por defecto.
        datos = request.get_json() or {}

        # @galaxiahfast - Extrae los parámetros de coordenadas enviados desde el frontend.
        posicionX = datos.get('posicionX', '')
        posicionY = datos.get('posicionY', '')

        # @galaxiahfast - Valida la presencia obligatoria de las coordenadas.
        if not posicionX or not posicionY:
            return jsonify({
                'estado': 'error',
                'mensaje': 'Coordenadas obligatorias'
            }), 400

        # @galaxiahfast - Guarda el dispositivo en la tabla maestra y genera sus detalles por defecto.
        idDispositivo = crearDispositivo(posicionX, posicionY)

        # @galaxiahfast - Retorna confirmación de operación exitosa con el ID generado.
        return jsonify({
            'estado': 'exito',
            'idDispositivo': idDispositivo
        }), 200

    # @galaxiahfast - Captura fallos imprevistos y devuelve un código de error interno.
    except Exception as error:
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 500



# @galaxiahfast - Endpoint para actualizar las coordenadas de un dispositivo existente.
@aplicacion.route('/api/dispositivos/mover', methods=['POST'])
def peticionMoverDispositivo():

    # @galaxiahfast - Gestiona la actualización de posición del dispositivo.
    try:

        # @galaxiahfast - Extrae los parámetros del cuerpo de la solicitud.
        datos = request.get_json() or {}
        idDispositivo = datos.get('idDispositivo')
        posicionX = datos.get('posicionX', '')
        posicionY = datos.get('posicionY', '')

        # @galaxiahfast - Valida la presencia obligatoria del identificador y coordenadas.
        if not idDispositivo or not posicionX or not posicionY:
            return jsonify({'estado': 'error', 'mensaje': 'Parámetros incompletos'}), 400

        # @galaxiahfast - Actualiza las coordenadas del dispositivo en la base de datos.
        moverDispositivo(idDispositivo, posicionX, posicionY)

        # @galaxiahfast - Retorna confirmación de actualización exitosa.
        return jsonify({'estado': 'exito'}), 200

    # @galaxiahfast - Procesa errores críticos devolviendo la descripción de la falla.
    except Exception as error:
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 500



# @galaxiahfast - Endpoint para alternar la visibilidad de un dispositivo en el mapa.
@aplicacion.route('/api/dispositivos/ocultar', methods=['POST'])
def peticionOcultarDispositivo():

    # @galaxiahfast - Controla la alternancia de visibilidad del dispositivo.
    try:

        # @galaxiahfast - Extrae el identificador del cuerpo de la solicitud.
        datos = request.get_json() or {}
        idDispositivo = datos.get('idDispositivo')

        # @galaxiahfast - Valida que el identificador no sea vacío.
        if not idDispositivo:
            return jsonify({'estado': 'error'}), 400

        # @galaxiahfast - Alterna el estado de visibilidad del dispositivo.
        ocultarDispositivo(idDispositivo)

        # @galaxiahfast - Retorna estado de éxito.
        return jsonify({'estado': 'exito'}), 200

    # @galaxiahfast - Devuelve el error capturado estructurado en formato JSON.
    except Exception as error:
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 500



# @galaxiahfast - Endpoint para el borrado lógico de un dispositivo existente.
@aplicacion.route('/api/dispositivos/eliminar', methods=['POST'])
def peticionEliminarDispositivo():

    # @galaxiahfast - Controla la baja lógica del dispositivo.
    try:

        # @galaxiahfast - Extrae el identificador del cuerpo de la solicitud.
        datos = request.get_json() or {}
        idDispositivo = datos.get('idDispositivo')

        # @galaxiahfast - Valida que el identificador no sea vacío.
        if not idDispositivo:
            return jsonify({'estado': 'error'}), 400

        # @galaxiahfast - Cambia el estado del dispositivo para enviarlo a la papelera.
        eliminarDispositivo(idDispositivo)

        # @galaxiahfast - Retorna estado de éxito.
        return jsonify({'estado': 'exito'}), 200

    # @galaxiahfast - Devuelve el error capturado estructurado en formato JSON.
    except Exception as error:
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 500



# @galaxiahfast - Endpoint para restaurar un dispositivo desde la papelera.
@aplicacion.route('/api/dispositivos/restaurar', methods=['POST'])
def peticionRestaurarDispositivo():

    # @galaxiahfast - Controla la recuperación del dispositivo eliminado.
    try:

        # @galaxiahfast - Obtiene los datos del cuerpo de la solicitud HTTP.
        datos = request.get_json() or {}
        idDispositivo = datos.get('idDispositivo')

        # @galaxiahfast - Verifica que se haya enviado el identificador objetivo.
        if not idDispositivo:
            return jsonify({'estado': 'error'}), 400

        # @galaxiahfast - Restaura el dispositivo desde la papelera.
        restaurarDispositivo(idDispositivo)

        # @galaxiahfast - Retorna respuesta estructurada con mensaje de éxito.
        return jsonify({
            'estado': 'exito',
            'mensaje': 'Dispositivo restaurado correctamente.'
        }), 200

    # @galaxiahfast - Captura excepciones de base de datos o lógica empresarial.
    except Exception as error:
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 500



# @galaxiahfast - Endpoint para purgar de forma permanente un dispositivo del sistema.
@aplicacion.route('/api/dispositivos/eliminar-definitivo', methods=['POST'])
def peticionEliminarDispositivoDefinitivo():

    # @galaxiahfast - Controla la eliminación física y la limpieza en cascada.
    try:

        # @galaxiahfast - Recupera la información de entrada desde el cliente.
        datos = request.get_json() or {}
        idDispositivo = datos.get('idDispositivo')

        # @galaxiahfast - Valida la presencia del campo obligatorio.
        if not idDispositivo:
            return jsonify({'estado': 'error'}), 400

        # @galaxiahfast - Remueve permanentemente el dispositivo y sus dependencias.
        eliminarDispositivoDefinitivo(idDispositivo)

        # @galaxiahfast - Retorna confirmación de borrado físico irreversible.
        return jsonify({
            'estado': 'exito',
            'mensaje': 'Dispositivo eliminado definitivamente.'
        }), 200

    # @galaxiahfast - Atrapa errores críticos de integridad o infraestructura.
    except Exception as error:
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 500



# ==========================================================================
# @galaxiahfast - ENDPOINTS DE PAPELERA
# ==========================================================================



# @galaxiahfast - Endpoint para consultar los elementos en la papelera (dispositivos y apartados).
@aplicacion.route('/api/papelera/listar', methods=['GET'])
def peticionListarPapelera():

    # @galaxiahfast - Controla la lectura de registros eliminados de la base de datos.
    try:

        # @galaxiahfast - Consulta ambas colecciones de elementos eliminados.
        return jsonify({
            'estado': 'exito',
            'dispositivos': listarDispositivosEliminados(),
            'apartados': listarApartadosEliminados()
        }), 200

    # @galaxiahfast - Captura anomalías imprevistas del servidor durante la lectura.
    except Exception as error:
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 500



# ==========================================================================
# @galaxiahfast - ENDPOINTS DE DETALLES
# ==========================================================================



# @galaxiahfast - Endpoint para obtener los detalles de un dispositivo específico.
@aplicacion.route('/api/detalles/obtener', methods=['POST'])
def peticionObtenerDetalles():

    # @galaxiahfast - Controla la lectura de detalles del dispositivo.
    try:

        # @galaxiahfast - Extrae el identificador del dispositivo.
        datos = request.get_json() or {}
        idDispositivo = datos.get('idDispositivo')

        # @galaxiahfast - Valida la presencia del identificador.
        if not idDispositivo:
            return jsonify({'estado': 'error'}), 400

        # @galaxiahfast - Obtiene los detalles vinculados al dispositivo.
        return jsonify({
            'estado': 'exito',
            'detalles': obtenerDetallesDispositivo(idDispositivo)
        }), 200

    # @galaxiahfast - Captura anomalías imprevistas.
    except Exception as error:
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 500



# @galaxiahfast - Endpoint para actualizar el valor de un detalle específico de un dispositivo.
@aplicacion.route('/api/detalles/actualizar', methods=['POST'])
def peticionActualizarDetalle():

    # @galaxiahfast - Gestiona la actualización del valor personalizado.
    try:

        # @galaxiahfast - Extrae los parámetros del cuerpo de la petición.
        datos = request.get_json() or {}
        idDispositivo = datos.get('idDispositivo')
        idApartado = datos.get('idApartado')
        valor = datos.get('valor', '')

        # @galaxiahfast - Valida la presencia de los identificadores obligatorios.
        if not idDispositivo or not idApartado:
            return jsonify({'estado': 'error', 'mensaje': 'Parámetros incompletos'}), 400

        # @galaxiahfast - Actualiza el valor del detalle marcándolo como personalizado.
        actualizarDetalle(idDispositivo, idApartado, valor)

        # @galaxiahfast - Retorna confirmación de actualización exitosa.
        return jsonify({'estado': 'exito'}), 200

    # @galaxiahfast - Procesa errores críticos devolviendo la descripción de la falla.
    except Exception as error:
        return jsonify({'estado': 'error', 'mensaje': str(error)}), 500

