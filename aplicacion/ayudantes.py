


import re
import unicodedata

# @galaxiahfast - Normaliza nombres técnicos eliminando acentos, espacios y caracteres inconsistentes. Recibe nombreApartado (str). Retorna str (texto normalizado).
def normalizarNombreApartado(
    nombreApartado: str
) -> str:

    # @galaxiahfast - Limpia espacios laterales y convierte el texto a mayúsculas técnicas.
    nombreNormalizado = nombreApartado.strip().upper()

    # @galaxiahfast - Elimina tildes y caracteres unicode complejos conservando solo ASCII limpio.
    nombreNormalizado = unicodedata.normalize(
        'NFKD',
        nombreNormalizado
    ).encode(
        'ASCII',
        'ignore'
    ).decode(
        'utf-8'
    )

    # @galaxiahfast - Sustituye múltiples espacios internos consecutivos por un único guion bajo.
    nombreNormalizado = re.sub(
        r'\s+',
        '_',
        nombreNormalizado
    )

    # @galaxiahfast - Retorna la cadena de texto completamente procesada y normalizada.
    return nombreNormalizado


