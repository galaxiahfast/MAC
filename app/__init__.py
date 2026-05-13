from flask import Flask

# ==========================================================================
# CONFIGURACIÓN Y CREACIÓN DEL OBJETO APP
# ==========================================================================
def create_app():
    app = Flask(__name__)
    with app.app_context():
        from . import routes
        return app