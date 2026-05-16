from flask import Flask
from flask_compress import Compress
from flask_minify import Minify

"""
==========================================================================
CONFIGURACIÓN Y CREACIÓN DEL OBJETO APP
==========================================================================
"""
def create_app():
    app = Flask(__name__)

    # app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 31536000
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
    app.config['TEMPLATES_AUTO_RELOAD'] = True 

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
    Minify(app, html=True, js=True, cssless=False)
    
    with app.app_context():
        from . import routes
        
    return app