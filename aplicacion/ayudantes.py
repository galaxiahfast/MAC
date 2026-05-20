


import re
import unicodedata



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


