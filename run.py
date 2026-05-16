from app import create_app
from app.utils import ejecutar_respaldo

"""
==========================================================================
PUNTO DE ENTRADA Y LANZAMIENTO DEL SERVIDOR
==========================================================================
"""
app = create_app()

if __name__ == '__main__':
    ejecutar_respaldo()
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)