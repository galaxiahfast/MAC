// @galaxiahfast - Módulo de comunicación HTTP para operaciones CRUD con el backend de apartados globales.
export async function get(url) {
    const res = await fetch(url);
    return await res.json();
}

// @galaxiahfast - Función genérica para enviar datos al servidor utilizando POST, con manejo de JSON.
export async function post(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {})
    });
    return await res.json();
}

// @galaxiahfast - API específica para operaciones relacionadas con apartados globales, utilizando las funciones genéricas de GET y POST.
export const ApartadosAPI = {

    // @galaxiahfast - Listado completo de apartados globales.
    listar: () => get('/api/apartados/listar'),

    // @galaxiahfast - Creación de un nuevo apartado global con nombre y valor predeterminado.
    crear: (payload) => post('/api/apartados/crear', payload),

    // @galaxiahfast - Baja lógica de un apartado global, moviéndolo a papelera.
    eliminar: (nombreApartado) =>
        post('/api/apartados/eliminar', { nombreApartado }),

    // @galaxiahfast - Restauración lógica de un apartado global desde la papelera.
    restaurar: (nombreApartado) =>
        post('/api/apartados/restaurar', { nombreApartado }),

    // @galaxiahfast - Eliminación definitiva de un apartado global, removiéndolo completamente del sistema.
    eliminarDefinitivo: (nombreApartado) =>
        post('/api/apartados/eliminar-definitivo', { nombreApartado })
};

// @galaxiahfast - API específica para operaciones relacionadas con dispositivos del mapa.
export const DispositivosAPI = {

    // @galaxiahfast - Listado completo de dispositivos activos con sus detalles.
    listar: () => get('/api/dispositivos/listar'),

    // @galaxiahfast - Creación de un nuevo dispositivo con coordenadas en el mapa.
    crear: (posicionX, posicionY) =>
        post('/api/dispositivos/crear', { posicionX, posicionY }),

    // @galaxiahfast - Actualización de las coordenadas de un dispositivo existente.
    mover: (idDispositivo, posicionX, posicionY) =>
        post('/api/dispositivos/mover', { idDispositivo, posicionX, posicionY }),

    // @galaxiahfast - Alternancia de la visibilidad de un dispositivo en el mapa.
    ocultar: (idDispositivo) =>
        post('/api/dispositivos/ocultar', { idDispositivo }),

    // @galaxiahfast - Baja lógica de un dispositivo, moviéndolo a papelera.
    eliminar: (idDispositivo) =>
        post('/api/dispositivos/eliminar', { idDispositivo }),

    // @galaxiahfast - Restauración lógica de un dispositivo desde la papelera.
    restaurar: (idDispositivo) =>
        post('/api/dispositivos/restaurar', { idDispositivo }),

    // @galaxiahfast - Eliminación definitiva de un dispositivo, removiéndolo completamente del sistema.
    eliminarDefinitivo: (idDispositivo) =>
        post('/api/dispositivos/eliminar-definitivo', { idDispositivo })
};

// @galaxiahfast - API específica para operaciones de la papelera (elementos eliminados).
export const PapeleraAPI = {

    // @galaxiahfast - Listado de todos los elementos eliminados (dispositivos y apartados).
    listar: () => get('/api/papelera/listar')
};

// @galaxiahfast - API específica para operaciones de detalles de dispositivos.
export const DetallesAPI = {

    // @galaxiahfast - Obtención de todos los detalles de un dispositivo específico.
    obtener: (idDispositivo) =>
        post('/api/detalles/obtener', { idDispositivo }),

    // @galaxiahfast - Actualización del valor de un detalle específico de un dispositivo.
    actualizar: (idDispositivo, idApartado, valor) =>
        post('/api/detalles/actualizar', { idDispositivo, idApartado, valor })
};