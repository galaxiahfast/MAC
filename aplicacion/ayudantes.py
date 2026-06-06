


import re
import unicodedata
from functools import wraps
from flask import request, jsonify



# @galaxiahfast - Normaliza nombres técnicos eliminando acentos, espacios laterales y caracteres inconsistentes. Recibe nombreApartado (str). Retorna str (texto procesado).
def normalizarNombreApartado(nombreApartado: str) -> str:

    # @galaxiahfast - Remueve espacios en los extremos y convierte la cadena a mayúsculas.
    nombreNormalizado = nombreApartado.strip().upper()

    # @galaxiahfast - Descompone la cadena para eliminar tildes y caracteres no ASCII.
    nombreNormalizado = unicodedata.normalize(
        'NFKD',
        nombreNormalizado
    ).encode(
        'ASCII',
        'ignore'
    ).decode('utf-8')

    # @galaxiahfast - Reemplaza los espacios en blanco internos por guiones bajos.
    nombreNormalizado = re.sub(r'\s+', '_', nombreNormalizado)

    # @galaxiahfast - Retorna la cadena de texto final completamente limpia y estandarizada.
    return nombreNormalizado


def extraerNombreApartado():
    datos = request.get_json() or {}
    nombreApartado = datos.get('nombreApartado', '')
    if not nombreApartado:
        return None, datos
    return normalizarNombreApartado(nombreApartado), datos


def manejarErroresRuta(funcion):
    @wraps(funcion)
    def wrapper(*args, **kwargs):
        try:
            return funcion(*args, **kwargs)
        except Exception as error:
            return jsonify({'estado': 'error', 'mensaje': str(error)}), 500
    return wrapper


