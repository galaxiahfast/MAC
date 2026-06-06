


import logging

from flask import Flask
from flask_compress import Compress
from flask_minify import Minify
from .baseDatos.conectar import inicializarBaseDatos

logger = logging.getLogger(__name__)

# @galaxiahfast - Inicializa Flask, optimiza recursos y verifica la conexión MySQL. No recibe parámetros. Retorna Flask (servidor configurado).
def crearAplicacion() -> Flask:
    aplicacion = Flask(__name__)

    # @galaxiahfast - Desactiva la caché de estáticos y fuerza la recarga de plantillas.
    aplicacion.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
    aplicacion.config['TEMPLATES_AUTO_RELOAD'] = True

    # @galaxiahfast - Configura y activa la compresión Gzip para las respuestas HTTP.
    aplicacion.config['COMPRESS_MIN_SIZE'] = 0
    aplicacion.config['COMPRESS_MIMETYPES'] = [
        'text/html',
        'text/css',
        'text/xml',
        'application/json',
        'application/javascript',
        'image/svg+xml'
    ]
    Compress(aplicacion)

    # @galaxiahfast - Inicializa la minificación automática de respuestas HTML y JavaScript.
    Minify(
        aplicacion,
        html=True,
        js=True,
        cssless=False
    )

    # @galaxiahfast - Intenta verificar la base de datos controlando excepciones para no tumbar el servidor.
    try:
        inicializarBaseDatos()
    except Exception as error:
        logger.warning('Base de datos no disponible al iniciar: %s', error)

    # @galaxiahfast - Importa y registra los controladores dentro del contexto de Flask.
    with aplicacion.app_context():
        from . import peticiones

    # @galaxiahfast - Retorna la instancia de la aplicación totalmente configurada.
    return aplicacion


