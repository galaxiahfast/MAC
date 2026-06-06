
import os

from aplicacion import crearAplicacion



# @galaxiahfast - Inicializa la instancia principal del servidor mediante la fábrica.
aplicacion = crearAplicacion()

# @galaxiahfast - Arranca el servidor web local en modo desarrollo. No recibe parámetros. Retorna None.
if __name__ == '__main__':
    aplicacion.run(
        debug=os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1'),
        host=os.environ.get('FLASK_HOST', '127.0.0.1'),
        port=int(os.environ.get('FLASK_PORT', 5000))
    )


