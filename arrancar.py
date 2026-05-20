


from aplicacion import crearAplicacion

# @galaxiahfast - Inicializa la instancia principal del servidor mediante la fábrica.
aplicacion = crearAplicacion()

# @galaxiahfast - Arranca el servidor web local en modo desarrollo. No recibe parámetros. Retorna None.
if __name__ == '__main__':
    aplicacion.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )


