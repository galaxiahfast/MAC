

from contextlib import contextmanager
from .conectar import obtenerConexion


@contextmanager
def conexion_lectura():
    conexion = None
    cursor = None
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor(dictionary=True)
        yield cursor
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()


@contextmanager
def conexion_escritura(diccionario=True):
    conexion = None
    cursor = None
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor(dictionary=diccionario)
        yield cursor
        conexion.commit()
    except Exception:
        if conexion:
            conexion.rollback()
        raise
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()


def buscarApartadoPorNombre(cursor, nombreApartado, solo_activos=False):
    filtro_eliminado = "AND estadoEliminado = FALSE" if solo_activos else ""
    cursor.execute(f"""
        SELECT id, valorPredeterminado
        FROM apartados
        WHERE UPPER(nombreApartado) = UPPER(%s)
        {filtro_eliminado}
    """, (nombreApartado,))
    return cursor.fetchone()
