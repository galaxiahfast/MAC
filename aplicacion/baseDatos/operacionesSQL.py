

import threading
from .conectar import obtenerConexion



# @galaxiahfast - Obtiene todos los apartados activos disponibles para renderizado dinámico en frontend. No recibe parámetros. Retorna list[dict] (colección de registros activos).
def listarApartados() -> list[dict]:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Controla lectura SQL asegurando captura de errores y liberación de recursos.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor(dictionary=True)

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

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()





def vincularApartadoADispositivos(idApartado, valorPredeterminado):
    # Nota: Esta función abre su propia conexión independiente
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
    conexion = None
    cursor = None
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor(dictionary=True)

        # 1. Verificación rápida (necesaria para evitar duplicados)
        cursor.execute("SELECT id FROM apartados WHERE UPPER(nombreApartado) = UPPER(%s) AND estadoEliminado = FALSE", (nombreApartado,))
        if cursor.fetchone():
            raise ValueError("El apartado ya existe.")

        # 2. Insertar solo el Apartado
        cursor.execute("INSERT INTO apartados (nombreApartado, valorPredeterminado) VALUES (%s, %s)", (nombreApartado, valorPredeterminado))
        idApartado = cursor.lastrowid
        
        conexion.commit() # Confirmamos la creación del apartado
        
        # 3. Delegar el trabajo pesado a un hilo (Background Thread)
        threading.Thread(target=vincularApartadoADispositivos, args=(idApartado, valorPredeterminado)).start()
        
    except Exception:
        if conexion: conexion.rollback()
        raise
    finally:
        if cursor: cursor.close()
        if conexion and conexion.is_connected(): conexion.close()



# @galaxiahfast - Ejecuta el borrado lógico de un apartado dinámico existente. Recibe nombreApartado (str). Retorna None.
def eliminarApartado(nombreApartado: str) -> None:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Ejecuta operación SQL controlando integridad transaccional.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor(dictionary=True)

        # @galaxiahfast - Verifica que el apartado exista y permanezca activo dentro de la base de datos.
        cursor.execute("""
            SELECT id
            FROM apartados
            WHERE UPPER(nombreApartado) = UPPER(%s)
            AND estadoEliminado = FALSE
        """, (nombreApartado,))
        apartado = cursor.fetchone()

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

        # @galaxiahfast - Confirma permanentemente todos los cambios realizados.
        conexion.commit()

    # @galaxiahfast - Revierte la transacción completa ante cualquier fallo abortando los cambios y propagando el error original.
    except Exception:
        if conexion:
            conexion.rollback()
        raise

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()



# @galaxiahfast - Actualiza el nombre y valor predeterminado de un apartado propagando cambios únicamente a dispositivos no personalizados. Recibe idApartado (int), nuevoNombre (str), nuevoValorPredeterminado (str). Retorna None.
def editarApartado(idApartado: int, nuevoNombre: str, nuevoValorPredeterminado: str) -> None:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Ejecuta la actualización completa dentro de una transacción SQL controlada.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor()

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

        # @galaxiahfast - Confirma permanentemente todos los cambios realizados.
        conexion.commit()

    # @galaxiahfast - Revierte la transacción completa ante cualquier fallo abortando cambios inconsistentes y propagando el error original.
    except Exception:
        if conexion:
            conexion.rollback()
        raise

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()



# @galaxiahfast - Actualiza el valor de un apartado para un dispositivo específico y lo marca como personalizado de forma permanente. Recibe idDispositivo (int), idApartado (int), valor (str). Retorna None.
def actualizarDetalle(idDispositivo: int, idApartado: int, valor: str) -> None:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Ejecuta la actualización del detalle controlando la transacción.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor()

        # @galaxiahfast - Modifica el valor rompiendo el vínculo de herencia global al establecer esPersonalizado en verdadero.
        cursor.execute("""
            UPDATE detallesDispositivos
            SET valorDetalle = %s,
                esPersonalizado = TRUE
            WHERE idDispositivo = %s
            AND idApartado = %s
        """, (valor, idDispositivo, idApartado))

        # @galaxiahfast - Confirma permanentemente todos los cambios realizados.
        conexion.commit()

    # @galaxiahfast - Revierte la transacción completa ante cualquier fallo abortando cambios inconsistentes y propagando el error original.
    except Exception:
        if conexion:
            conexion.rollback()
        raise

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()



# @galaxiahfast - Ejecuta la restauración lógica de un apartado dinámico y restablece el valor predeterminado en dispositivos no personalizados. Recibe nombreApartado (str). Retorna None.
def restaurarApartado(nombreApartado: str) -> None:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Ejecuta la restauración completa dentro de una transacción SQL controlada.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor(dictionary=True)

        # @galaxiahfast - Recupera la información del apartado objetivo ignorando su estado de eliminación actual.
        cursor.execute("""
            SELECT id, valorPredeterminado
            FROM apartados
            WHERE UPPER(nombreApartado) = UPPER(%s)
        """, (nombreApartado,))
        apartado = cursor.fetchone()

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

        # @galaxiahfast - Confirma permanentemente todos los cambios realizados en la transacción.
        conexion.commit()

    # @galaxiahfast - Revierte la transacción completa ante cualquier fallo abortando cambios inconsistentes y propagando el error original.
    except Exception:
        if conexion:
            conexion.rollback()
        raise

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()



# @galaxiahfast - Ejecuta el borrado físico y definitivo de un apartado del catálogo y purga todas sus relaciones en cascada manual. Recibe nombreApartado (str). Retorna None.
def eliminarApartadoDefinitivo(nombreApartado: str) -> None:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Ejecuta la eliminación física completa dentro de una transacción SQL controlada.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor(dictionary=True)

        # @galaxiahfast - Recupera la información del apartado objetivo sin importar si contaba con un estado de eliminación previa.
        cursor.execute("""
            SELECT id
            FROM apartados
            WHERE UPPER(nombreApartado) = UPPER(%s)
        """, (nombreApartado,))
        apartado = cursor.fetchone()

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

        # @galaxiahfast - Confirma permanentemente todos los cambios realizados en la transacción.
        conexion.commit()

    # @galaxiahfast - Revierte la transacción completa ante cualquier fallo abortando cambios inconsistentes y propagando el error original.
    except Exception:
        if conexion:
            conexion.rollback()
        raise

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()











# ==========================================================================
# OPERACIONES DE DISPOSITIVOS
# ==========================================================================



# @galaxiahfast - Obtiene todos los dispositivos activos con sus detalles dinámicos para renderizado en el mapa. No recibe parámetros. Retorna list[dict] (colección de dispositivos con apartados).
def listarDispositivos() -> list[dict]:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Controla lectura SQL asegurando captura de errores y liberación de recursos.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor(dictionary=True)

        # @galaxiahfast - Recupera únicamente dispositivos activos excluyendo elementos enviados a papelera.
        cursor.execute("""
            SELECT
                id,
                posicionX,
                posicionY,
                estadoVisible,
                fechaCreacion
            FROM dispositivos
            WHERE estadoEliminado = FALSE
            ORDER BY id ASC
        """)
        dispositivos = cursor.fetchall()

        # @galaxiahfast - Para cada dispositivo, obtiene sus detalles dinámicos asociados.
        for dispositivo in dispositivos:
            cursor.execute("""
                SELECT
                    a.nombreApartado,
                    dd.valorDetalle,
                    dd.esPersonalizado
                FROM detallesDispositivos dd
                INNER JOIN apartados a ON a.id = dd.idApartado
                WHERE dd.idDispositivo = %s
                AND a.estadoEliminado = FALSE
            """, (dispositivo["id"],))
            dispositivo["detalles"] = cursor.fetchall()

        # @galaxiahfast - Retorna directamente la colección estructurada de dispositivos obtenidos.
        return dispositivos

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()



# @galaxiahfast - Registra un nuevo dispositivo en el mapa y genera sus detalles por defecto desde el catálogo de apartados. Recibe posicionX (str), posicionY (str). Retorna int (ID del nuevo dispositivo).
def crearDispositivo(posicionX: str, posicionY: str) -> int:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Ejecuta la inserción dentro de una transacción SQL controlada.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor(dictionary=True)

        # @galaxiahfast - Inserta el nuevo dispositivo con sus coordenadas en la tabla maestra.
        cursor.execute("""
            INSERT INTO dispositivos (posicionX, posicionY)
            VALUES (%s, %s)
        """, (posicionX, posicionY))
        idDispositivo = cursor.lastrowid

        # @galaxiahfast - Recupera todos los apartados activos para vincularlos automáticamente al nuevo dispositivo.
        cursor.execute("""
            SELECT id, valorPredeterminado
            FROM apartados
            WHERE estadoEliminado = FALSE
        """)
        apartados = cursor.fetchall()

        # @galaxiahfast - Inserta un detalle por cada apartado activo usando el valor predeterminado global.
        if apartados:
            datos_bulk = [
                (idDispositivo, a["id"], a["valorPredeterminado"], False)
                for a in apartados
            ]
            cursor.executemany("""
                INSERT INTO detallesDispositivos (idDispositivo, idApartado, valorDetalle, esPersonalizado)
                VALUES (%s, %s, %s, %s)
            """, datos_bulk)

        # @galaxiahfast - Confirma permanentemente todos los cambios realizados.
        conexion.commit()

        # @galaxiahfast - Retorna el identificador del nuevo dispositivo creado.
        return idDispositivo

    # @galaxiahfast - Revierte la transacción completa ante cualquier fallo abortando los cambios y propagando el error original.
    except Exception:
        if conexion:
            conexion.rollback()
        raise

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()



# @galaxiahfast - Actualiza las coordenadas de un dispositivo existente en el mapa. Recibe idDispositivo (int), posicionX (str), posicionY (str). Retorna None.
def moverDispositivo(idDispositivo: int, posicionX: str, posicionY: str) -> None:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Ejecuta la actualización de coordenadas dentro de una transacción SQL controlada.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor()

        # @galaxiahfast - Modifica las coordenadas del dispositivo seleccionado.
        cursor.execute("""
            UPDATE dispositivos
            SET posicionX = %s,
                posicionY = %s
            WHERE id = %s
            AND estadoEliminado = FALSE
        """, (posicionX, posicionY, idDispositivo))

        # @galaxiahfast - Verifica que el dispositivo exista y se haya actualizado correctamente.
        if cursor.rowcount == 0:
            raise ValueError("El dispositivo no existe o ya fue eliminado.")

        # @galaxiahfast - Confirma permanentemente todos los cambios realizados.
        conexion.commit()

    # @galaxiahfast - Revierte la transacción completa ante cualquier fallo abortando los cambios y propagando el error original.
    except Exception:
        if conexion:
            conexion.rollback()
        raise

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()



# @galaxiahfast - Alterna la visibilidad de un dispositivo en el mapa sin eliminarlo. Recibe idDispositivo (int). Retorna None.
def ocultarDispositivo(idDispositivo: int) -> None:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Ejecuta la alternancia de visibilidad dentro de una transacción SQL controlada.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor()

        # @galaxiahfast - Invierte el estado de visibilidad del dispositivo seleccionado.
        cursor.execute("""
            UPDATE dispositivos
            SET estadoVisible = NOT estadoVisible
            WHERE id = %s
            AND estadoEliminado = FALSE
        """, (idDispositivo,))

        # @galaxiahfast - Verifica que el dispositivo exista y se haya actualizado correctamente.
        if cursor.rowcount == 0:
            raise ValueError("El dispositivo no existe o ya fue eliminado.")

        # @galaxiahfast - Confirma permanentemente todos los cambios realizados.
        conexion.commit()

    # @galaxiahfast - Revierte la transacción completa ante cualquier fallo abortando los cambios y propagando el error original.
    except Exception:
        if conexion:
            conexion.rollback()
        raise

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()



# @galaxiahfast - Ejecuta el borrado lógico de un dispositivo existente. Recibe idDispositivo (int). Retorna None.
def eliminarDispositivo(idDispositivo: int) -> None:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Ejecuta operación SQL controlando integridad transaccional.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor()

        # @galaxiahfast - Marca el dispositivo como eliminado registrando fecha de baja lógica.
        cursor.execute("""
            UPDATE dispositivos
            SET estadoEliminado = TRUE,
                fechaEliminacion = NOW()
            WHERE id = %s
            AND estadoEliminado = FALSE
        """, (idDispositivo,))

        # @galaxiahfast - Verifica que el dispositivo exista y se haya eliminado correctamente.
        if cursor.rowcount == 0:
            raise ValueError("El dispositivo no existe o ya fue eliminado.")

        # @galaxiahfast - Confirma permanentemente todos los cambios realizados.
        conexion.commit()

    # @galaxiahfast - Revierte la transacción completa ante cualquier fallo abortando los cambios y propagando el error original.
    except Exception:
        if conexion:
            conexion.rollback()
        raise

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()



# @galaxiahfast - Restaura un dispositivo previamente eliminado de forma lógica. Recibe idDispositivo (int). Retorna None.
def restaurarDispositivo(idDispositivo: int) -> None:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Ejecuta la restauración dentro de una transacción SQL controlada.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor()

        # @galaxiahfast - Revierte la baja lógica del dispositivo restableciendo las banderas de control de eliminación.
        cursor.execute("""
            UPDATE dispositivos
            SET estadoEliminado = FALSE,
                fechaEliminacion = NULL
            WHERE id = %s
            AND estadoEliminado = TRUE
        """, (idDispositivo,))

        # @galaxiahfast - Verifica que el dispositivo existiera en papelera.
        if cursor.rowcount == 0:
            raise ValueError("El dispositivo no existe en la papelera.")

        # @galaxiahfast - Confirma permanentemente todos los cambios realizados.
        conexion.commit()

    # @galaxiahfast - Revierte la transacción completa ante cualquier fallo abortando los cambios y propagando el error original.
    except Exception:
        if conexion:
            conexion.rollback()
        raise

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()



# @galaxiahfast - Ejecuta el borrado físico y definitivo de un dispositivo y purga todas sus relaciones. Recibe idDispositivo (int). Retorna None.
def eliminarDispositivoDefinitivo(idDispositivo: int) -> None:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Ejecuta la eliminación física completa dentro de una transacción SQL controlada.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor()

        # @galaxiahfast - Remueve en primera instancia los registros dependientes en la tabla de detalles.
        cursor.execute("""
            DELETE FROM detallesDispositivos
            WHERE idDispositivo = %s
        """, (idDispositivo,))

        # @galaxiahfast - Remueve de forma definitiva el registro maestro del dispositivo.
        cursor.execute("""
            DELETE FROM dispositivos
            WHERE id = %s
        """, (idDispositivo,))

        # @galaxiahfast - Verifica que el dispositivo existiera.
        if cursor.rowcount == 0:
            raise ValueError("El dispositivo no existe.")

        # @galaxiahfast - Confirma permanentemente todos los cambios realizados.
        conexion.commit()

    # @galaxiahfast - Revierte la transacción completa ante cualquier fallo abortando los cambios y propagando el error original.
    except Exception:
        if conexion:
            conexion.rollback()
        raise

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()



# @galaxiahfast - Lista los dispositivos que han sido eliminados lógicamente para la papelera. No recibe parámetros. Retorna list[dict].
def listarDispositivosEliminados() -> list[dict]:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Controla lectura SQL asegurando captura de errores y liberación de recursos.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor(dictionary=True)

        # @galaxiahfast - Recupera dispositivos en papelera ordenados por fecha de eliminación.
        cursor.execute("""
            SELECT
                id,
                posicionX,
                posicionY,
                fechaCreacion,
                fechaEliminacion
            FROM dispositivos
            WHERE estadoEliminado = TRUE
            ORDER BY fechaEliminacion DESC
        """)

        # @galaxiahfast - Retorna directamente la colección de dispositivos eliminados.
        return cursor.fetchall()

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()



# @galaxiahfast - Lista los apartados que han sido eliminados lógicamente para la papelera. No recibe parámetros. Retorna list[dict].
def listarApartadosEliminados() -> list[dict]:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Controla lectura SQL asegurando captura de errores y liberación de recursos.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor(dictionary=True)

        # @galaxiahfast - Recupera apartados en papelera ordenados por fecha de eliminación.
        cursor.execute("""
            SELECT
                id,
                nombreApartado,
                valorPredeterminado,
                fechaCreacion,
                fechaEliminacion
            FROM apartados
            WHERE estadoEliminado = TRUE
            ORDER BY fechaEliminacion DESC
        """)

        # @galaxiahfast - Retorna directamente la colección de apartados eliminados.
        return cursor.fetchall()

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()



# ==========================================================================
# OPERACIONES DE DETALLES
# ==========================================================================



# @galaxiahfast - Actualiza el valor de un apartado para un dispositivo específico y lo marca como personalizado. Recibe idDispositivo (int), idApartado (int), valor (str). Retorna None.
def actualizarDetalle(idDispositivo: int, idApartado: int, valor: str) -> None:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Ejecuta la actualización del detalle controlando la transacción.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor()

        # @galaxiahfast - Modifica el valor rompiendo el vínculo de herencia global al establecer esPersonalizado en verdadero.
        cursor.execute("""
            UPDATE detallesDispositivos
            SET valorDetalle = %s,
                esPersonalizado = TRUE
            WHERE idDispositivo = %s
            AND idApartado = %s
        """, (valor, idDispositivo, idApartado))

        # @galaxiahfast - Confirma permanentemente todos los cambios realizados.
        conexion.commit()

    # @galaxiahfast - Revierte la transacción completa ante cualquier fallo abortando cambios inconsistentes y propagando el error original.
    except Exception:
        if conexion:
            conexion.rollback()
        raise

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()



# @galaxiahfast - Obtiene todos los detalles dinámicos de un dispositivo específico. Recibe idDispositivo (int). Retorna list[dict].
def obtenerDetallesDispositivo(idDispositivo: int) -> list[dict]:

    # @galaxiahfast - Inicializa variables SQL para manejo seguro de recursos.
    conexion = None
    cursor = None

    # @galaxiahfast - Controla lectura SQL asegurando captura de errores y liberación de recursos.
    try:
        conexion = obtenerConexion()
        cursor = conexion.cursor(dictionary=True)

        # @galaxiahfast - Recupera todos los detalles vinculados al dispositivo con nombre de apartado.
        cursor.execute("""
            SELECT
                dd.id,
                dd.idApartado,
                a.nombreApartado,
                dd.valorDetalle,
                dd.esPersonalizado
            FROM detallesDispositivos dd
            INNER JOIN apartados a ON a.id = dd.idApartado
            WHERE dd.idDispositivo = %s
            AND a.estadoEliminado = FALSE
            ORDER BY a.nombreApartado ASC
        """, (idDispositivo,))

        # @galaxiahfast - Retorna la colección de detalles del dispositivo.
        return cursor.fetchall()

    # @galaxiahfast - Libera recursos SQL cerrando el cursor si existe y la conexión si continúa activa.
    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()