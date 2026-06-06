


import os
import secrets

from flask import Flask
from flask_compress import Compress
from flask_minify import Minify
from .baseDatos.conectar import inicializarBaseDatos

# @galaxiahfast - Inicializa Flask, optimiza recursos y verifica la conexión MySQL. No recibe parámetros. Retorna Flask (servidor configurado).
def crearAplicacion() -> Flask:
    aplicacion = Flask(__name__)

    # @galaxiahfast - Clave secreta para firmar sesiones y cookies (obligatoria en producción).
    aplicacion.config['SECRET_KEY'] = os.environ.get(
        'FLASK_SECRET_KEY',
        secrets.token_hex(32)
    )

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
        print(f'[MYSQL] Error de conexión: {error}')

    # @galaxiahfast - Importa y registra los controladores dentro del contexto de Flask.
    with aplicacion.app_context():
        from . import peticiones

    # @galaxiahfast - Retorna la instancia de la aplicación totalmente configurada.
    return aplicacion


