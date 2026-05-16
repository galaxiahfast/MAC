from flask import Flask
from flask_compress import Compress

"""
==========================================================================
CONFIGURACIÓN Y CREACIÓN DEL OBJETO APP
==========================================================================
"""
def create_app():
    app = Flask(__name__)

    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 31536000

    app.config['COMPRESS_MIN_SIZE'] = 0
    app.config['COMPRESS_MIMETYPES'] = [
        'text/html', 
        'text/css', 
        'text/xml', 
        'application/json', 
        'application/javascript', 
        'image/svg+xml'
    ]

    Compress(app)
    
    with app.app_context():
        from . import routes
        
    return app