


import threading
from .conectar import obtenerConexion
from .contexto import conexion_lectura, conexion_escritura, buscarApartadoPorNombre



# @galaxiahfast - Obtiene todos los apartados activos disponibles para renderizado dinámico en frontend. No recibe parámetros. Retorna list[dict] (colección de registros activos).
def listarApartados() -> list[dict]:

    with conexion_lectura() as cursor:

        # @galaxiahfast - Recupera únicamente apartados activos excluyendo elementos enviados a papelera.
        cursor.execute("""
            SELECT
                id,
                nombreApartado,
                valorPredeterminado,
                fechaCreacion
            FROM apartados
            WHERE estadoEliminado = FALSE
            ORDER BY nombreApartado ASC
        """)

        # @galaxiahfast - Retorna directamente la colección estructurada de registros obtenidos.
        return cursor.fetchall()





def vincularApartadoADispositivos(idApartado, valorPredeterminado):
    conexion = None
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor()
        
        cursor.execute("SELECT id FROM dispositivos")
        dispositivos = cursor.fetchall()
        
        if dispositivos:
            datos_bulk = [(d[0], idApartado, valorPredeterminado, False) for d in dispositivos]
            cursor.executemany("""
                INSERT INTO detallesDispositivos (idDispositivo, idApartado, valorDetalle, esPersonalizado)
                VALUES (%s, %s, %s, %s)
            """, datos_bulk)
            conexion.commit()
    except Exception as e:
        print(f"Error en segundo plano al vincular dispositivos: {e}")
    finally:
        if conexion and conexion.is_connected(): conexion.close()
        
def crearApartado(nombreApartado: str, valorPredeterminado: str) -> None:

    with conexion_escritura() as cursor:

        # 1. Verificación rápida (necesaria para evitar duplicados)
        cursor.execute("SELECT id FROM apartados WHERE UPPER(nombreApartado) = UPPER(%s) AND estadoEliminado = FALSE", (nombreApartado,))
        if cursor.fetchone():
            raise ValueError("El apartado ya existe.")

        # 2. Insertar solo el Apartado
        cursor.execute("INSERT INTO apartados (nombreApartado, valorPredeterminado) VALUES (%s, %s)", (nombreApartado, valorPredeterminado))
        idApartado = cursor.lastrowid
        
        # 3. Delegar el trabajo pesado a un hilo (Background Thread)
        threading.Thread(target=vincularApartadoADispositivos, args=(idApartado, valorPredeterminado)).start()



# @galaxiahfast - Ejecuta el borrado lógico de un apartado dinámico existente. Recibe nombreApartado (str). Retorna None.
def eliminarApartado(nombreApartado: str) -> None:

    with conexion_escritura() as cursor:

        # @galaxiahfast - Verifica que el apartado exista y permanezca activo dentro de la base de datos.
        apartado = buscarApartadoPorNombre(cursor, nombreApartado, solo_activos=True)

        # @galaxiahfast - Interrumpe el flujo lanzando una excepción si el apartado no existe o ya fue borrado.
        if not apartado:
            raise ValueError("El apartado no existe o ya fue eliminado.")

        # @galaxiahfast - Marca el apartado como eliminado registrando fecha de baja lógica.
        cursor.execute("""
            UPDATE apartados
            SET estadoEliminado = TRUE,
                fechaEliminacion = NOW()
            WHERE id = %s
        """, (apartado["id"],))



# @galaxiahfast - Actualiza el nombre y valor predeterminado de un apartado propagando cambios únicamente a dispositivos no personalizados. Recibe idApartado (int), nuevoNombre (str), nuevoValorPredeterminado (str). Retorna None.
def editarApartado(idApartado: int, nuevoNombre: str, nuevoValorPredeterminado: str) -> None:

    with conexion_escritura(diccionario=False) as cursor:

        # @galaxiahfast - Actualiza la información estructural base del apartado seleccionado.
        cursor.execute("""
            UPDATE apartados
            SET nombreApartado = %s,
                valorPredeterminado = %s
            WHERE id = %s
        """, (nuevoNombre, nuevoValorPredeterminado, idApartado))

        # @galaxiahfast - Actualiza los detalles de dispositivos que todavía heredan el comportamiento global y no han sido personalizados.
        cursor.execute("""
            UPDATE detallesDispositivos
            SET valorDetalle = %s
            WHERE idApartado = %s
            AND esPersonalizado = FALSE
        """, (nuevoValorPredeterminado, idApartado))



# @galaxiahfast - Actualiza el valor de un apartado para un dispositivo específico y lo marca como personalizado de forma permanente. Recibe idDispositivo (int), idApartado (int), valor (str). Retorna None.
def actualizarDetalle(idDispositivo: int, idApartado: int, valor: str) -> None:

    with conexion_escritura(diccionario=False) as cursor:

        # @galaxiahfast - Modifica el valor rompiendo el vínculo de herencia global al establecer esPersonalizado en verdadero.
        cursor.execute("""
            UPDATE detallesDispositivos
            SET valorDetalle = %s,
                esPersonalizado = TRUE
            WHERE idDispositivo = %s
            AND idApartado = %s
        """, (valor, idDispositivo, idApartado))



# @galaxiahfast - Ejecuta la restauración lógica de un apartado dinámico y restablece el valor predeterminado en dispositivos no personalizados. Recibe nombreApartado (str). Retorna None.
def restaurarApartado(nombreApartado: str) -> None:

    with conexion_escritura() as cursor:

        # @galaxiahfast - Recupera la información del apartado objetivo ignorando su estado de eliminación actual.
        apartado = buscarApartadoPorNombre(cursor, nombreApartado)

        # @galaxiahfast - Interrumpe el flujo lanzando una excepción si el apartado solicitado no existe en el sistema.
        if not apartado:
            raise ValueError("El apartado no existe.")

        # @galaxiahfast - Revierte la baja lógica del apartado restableciendo las banderas de control de eliminación.
        cursor.execute("""
            UPDATE apartados
            SET estadoEliminado = FALSE,
                fechaEliminacion = NULL
            WHERE id = %s
        """, (apartado["id"],))

        # @galaxiahfast - Restablece el valor predeterminado global en los detalles de dispositivos que no hayan sido personalizados.
        cursor.execute("""
            UPDATE detallesDispositivos
            SET valorDetalle = %s
            WHERE idApartado = %s
            AND esPersonalizado = FALSE
        """, (
            apartado["valorPredeterminado"],
            apartado["id"]
        ))



# @galaxiahfast - Ejecuta el borrado físico y definitivo de un apartado del catálogo y purga todas sus relaciones en cascada manual. Recibe nombreApartado (str). Retorna None.
def eliminarApartadoDefinitivo(nombreApartado: str) -> None:

    with conexion_escritura() as cursor:

        # @galaxiahfast - Recupera la información del apartado objetivo sin importar si contaba con un estado de eliminación previa.
        apartado = buscarApartadoPorNombre(cursor, nombreApartado)

        # @galaxiahfast - Interrumpe el flujo lanzando una excepción si el apartado solicitado no existe en el sistema.
        if not apartado:
            raise ValueError("El apartado no existe.")

        idApartado = apartado["id"]

        # @galaxiahfast - Remueve en primera instancia los registros dependientes en la tabla de detalles para asegurar la integridad referencial.
        cursor.execute("""
            DELETE FROM detallesDispositivos
            WHERE idApartado = %s
        """, (idApartado,))

        # @galaxiahfast - Remueve de forma definitiva el registro maestro del apartado seleccionado dentro de la tabla de catálogo.
        cursor.execute("""
            DELETE FROM apartados
            WHERE id = %s
        """, (idApartado,))







# ==========================================================================
# OPERACIONES DE DISPOSITIVOS
# ==========================================================================

def listarDispositivos():
    pass


def crearDispositivo():
    pass


def moverDispositivo():
    pass


def ocultarDispositivo():
    pass


def eliminarDispositivo():
    pass

# ==========================================================================
# OPERACIONES DE DETALLES
# ==========================================================================

def obtenerDetallesDispositivo():
    pass
