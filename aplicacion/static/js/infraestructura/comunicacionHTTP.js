// @galaxiahfast - Módulo de comunicación HTTP para operaciones CRUD con el backend de apartados globales.
export async function get(url) {
    const res = await fetch(url);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.mensaje || `HTTP ${res.status}`);
    }
    return await res.json();
}

// @galaxiahfast - Función genérica para enviar datos al servidor utilizando POST, con manejo de JSON.
export async function post(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {})
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.mensaje || `HTTP ${res.status}`);
    }
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