


from flask import request, jsonify, render_template, current_app as app

from .ayudantes import normalizarNombreApartado
from .baseDatos.operacionesSql import (
    crearApartado,
    eliminarApartado,
    listarApartados,
    editarApartado
)


# @galaxiahfast - Renderiza la vista principal del mapa interactivo. No recibe parámetros. Retorna str (renderizado HTML).
@app.route("/")
def index():
    return render_template("index.html")


# @galaxiahfast - Devuelve todos los apartados activos registrados para construcción dinámica del frontend. No recibe parámetros. Retorna Response (objeto JSON y código de estado).
@app.route("/api/apartados/listar", methods=["GET"])
def listar():

    # @galaxiahfast - Controla la lectura de registros y serialización de respuesta controlando excepciones.
    try:
        # @galaxiahfast - Retorna respuesta HTTP estructurada conteniendo los registros disponibles obtenidos desde la capa SQL.
        return jsonify({
            "estado": "exito",
            "apartados": listarApartados()
        })

    # @galaxiahfast - Captura errores internos inesperados devolviendo una respuesta estructurada de error del servidor.
    except Exception as e:
        return jsonify({"estado": "error", "mensaje": str(e)}), 500


# @galaxiahfast - Procesa la petición HTTP para registrar un nuevo apartado global. No recibe parámetros. Retorna Response (JSON estructurado).
@app.route("/api/apartados/crear", methods=["POST"])
def crear():

    # @galaxiahfast - Controla errores de captura, validación y persistencia para evitar fallos no controlados.
    try:
        # @galaxiahfast - Obtiene el cuerpo JSON asegurando un diccionario válido incluso si el frontend falla.
        data = request.get_json() or {}

        # @galaxiahfast - Extrae el nombre técnico y el valor predeterminado enviados desde la interfaz.
        nombre = data.get("nombreApartado", "")
        valor = data.get("valorPredeterminado", "")

        # @galaxiahfast - Verifica que exista el nombre obligatorio del apartado antes de procesar el flujo.
        if not nombre:
            return jsonify({"estado": "error", "mensaje": "Nombre requerido"}), 400

        # @galaxiahfast - Normaliza el nombre técnico para mantener consistencia técnica interna.
        nombre = normalizarNombreApartado(nombre)

        # @galaxiahfast - Ejecuta la inserción del apartado y sus relaciones automáticas.
        crearApartado(nombre, valor)

        # @galaxiahfast - Retorna respuesta HTTP indicando operación exitosa.
        return jsonify({"estado": "exito"}), 200

    # @galaxiahfast - Captura errores controlados de lógica empresarial retornando un estado controlado al cliente.
    except ValueError as e:
        return jsonify({"estado": "error", "mensaje": str(e)}), 400

    # @galaxiahfast - Captura errores internos inesperados devolviendo un error interno estructurado.
    except Exception as e:
        return jsonify({"estado": "error", "mensaje": str(e)}), 500


# @galaxiahfast - Procesa la eliminación lógica de un apartado dinámico existente. No recibe parámetros. Retorna Response (objeto JSON y código de estado).
@app.route("/api/apartados/eliminar", methods=["POST"])
def eliminar():

    # @galaxiahfast - Controla validaciones y ejecución de baja lógica controlando excepciones.
    try:
        # @galaxiahfast - Obtiene el cuerpo JSON asegurando una estructura válida.
        data = request.get_json() or {}
        nombre = data.get("nombreApartado", "")

        # @galaxiahfast - Verifica presencia del nombre obligatorio antes de ejecutar consultas SQL.
        if not nombre:
            return jsonify({"estado": "error"}), 400

        # @galaxiahfast - Normaliza el nombre para mantener consistencia estructural.
        nombre = normalizarNombreApartado(nombre)

        # @galaxiahfast - Ejecuta la baja lógica del apartado en la base de datos.
        eliminarApartado(nombre)

        # @galaxiahfast - Retorna respuesta HTTP indicando operación exitosa.
        return jsonify({"estado": "exito"}), 200

    # @galaxiahfast - Captura errores controlados de lógica empresarial retornando respuesta válida al cliente.
    except ValueError as e:
        return jsonify({"estado": "error", "mensaje": str(e)}), 400

    # @galaxiahfast - Captura errores internos inesperados devolviendo respuesta estructurada de error de servidor.
    except Exception as e:
        return jsonify({"estado": "error", "mensaje": str(e)}), 500


# @galaxiahfast - Procesa la actualización estructural y lógica de un apartado dinámico existente. No recibe parámetros. Retorna Response (objeto JSON y código de estado).
@app.route("/api/apartados/editar", methods=["POST"])
def editar():

    # @galaxiahfast - Controla validaciones, normalización y persistencia de cambios controlando excepciones.
    try:
        # @galaxiahfast - Obtiene el cuerpo JSON asegurando una estructura válida.
        data = request.get_json() or {}

        # @galaxiahfast - Recupera las variables enviadas desde el cuerpo de la petición.
        id_apartado = data.get("idApartado")
        nombre = data.get("nombreApartado", "")
        valor = data.get("valorPredeterminado", "")

        # @galaxiahfast - Verifica presencia obligatoria del identificador único.
        if id_apartado is None:
            return jsonify({"estado": "error"}), 400

        # @galaxiahfast - Verifica presencia obligatoria del nombre técnico del apartado.
        if not nombre:
            return jsonify({"estado": "error"}), 400

        # @galaxiahfast - Convierte el identificador recibido a entero asegurando un tipado consistente.
        id_apartado = int(id_apartado)

        # @galaxiahfast - Normaliza el nombre técnico para mantener consistencia estructural.
        nombre = normalizarNombreApartado(nombre)

        # @galaxiahfast - Ejecuta la actualización estructural y propagación inteligente de valores.
        editarApartado(id_apartado, nombre, valor)

        # @galaxiahfast - Retorna respuesta HTTP indicando actualización exitosa.
        return jsonify({"estado": "exito"}), 200

    # @galaxiahfast - Captura errores controlados de lógica empresarial retornando respuesta válida al cliente.
    except ValueError as e:
        return jsonify({"estado": "error", "mensaje": str(e)}), 400

    # @galaxiahfast - Captura errores internos inesperados devolviendo respuesta estructurada de error de servidor.
    except Exception as e:
        return jsonify({"estado": "error", "mensaje": str(e)}), 500
    

