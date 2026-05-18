


/* ==========================================================================
   PRECARGA DE DATOS (UNIFICADA)
   ========================================================================== */

/**
 * @galaxiahfast Carga los apartados desde el servidor y actualiza todos los cachés.
 * @galaxiahfast Esta función centraliza las precargas anteriores en un único flujo de datos.
 *
 * @param {boolean} forzarActualizacion - Si es true, ignora el caché existente.
 * @returns {Promise<Array>} Lista de apartados.
 */
async function cargarApartados(forzarActualizacion = false) {

    /* @galaxiahfast Verificar caché existente */
    if (!forzarActualizacion && window.cacheApartados) {
        console.log("📦 Usando caché de apartados:", window.cacheApartados);
        return window.cacheApartados;
    }

    try {

        const respuesta = await fetch('/api/config/apartados/listar');
        const datos = await respuesta.json();

        /* @galaxiahfast Validar respuesta del servidor */
        if (datos.estado === 'exito') {

            /* @galaxiahfast Actualizar caché principal */
            window.cacheApartados = datos.apartados;

            /* @galaxiahfast Sincronizar referencias globales */
            window.apartadosGlobales = window.cacheApartados;
            window.cacheEliminacion = window.cacheApartados;
            window.cacheAgregar = window.cacheApartados;

            console.log("📦 Apartados cargados desde API:", window.cacheApartados);

            return window.cacheApartados;

        } else {
            throw new Error(datos.mensaje);
        }

    } catch (error) {

        /* @galaxiahfast Manejo de errores en carga de apartados */
        console.error("Error cargando apartados:", error);

        mostrarNotificacion(
            "No se pudieron cargar los parámetros",
            "error"
        );

        return [];
    }
}


