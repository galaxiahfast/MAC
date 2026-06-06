


import logging

import mysql.connector
from mysql.connector.connection import MySQLConnection
from mysql.connector import Error

logger = logging.getLogger(__name__)

# @galaxiahfast - Parámetros de configuración, codificación y tiempo de espera para el motor MySQL.
configuracionBaseDatos = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '',
    'database': 'mapa_dispositivos',
    'charset': 'utf8mb4',
    'autocommit': False,
    'connection_timeout': 5
}

# @galaxiahfast - Abre una conexión activa con el servidor MySQL. No recibe parámetros. Retorna MySQLConnection (sesión activa).
def obtenerConexion() -> MySQLConnection:
    conexion = mysql.connector.connect(
        **configuracionBaseDatos
    )
    return conexion

# @galaxiahfast - Verifica la disponibilidad de MySQL controlando errores y cerrando el socket. No recibe parámetros. Retorna None.
def inicializarBaseDatos() -> None:
    conexion = None

    try:
        conexion = obtenerConexion()
        if conexion.is_connected():
            logger.info('Conexión MySQL establecida correctamente.')
    except Error as error:
        logger.error('Error de conexión MySQL: %s', error)
        raise
    finally:
        if conexion and conexion.is_connected():
            conexion.close()


