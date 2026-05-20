


// @galaxiahfast - Realiza petición genérica GET.
export async function get(url) {

    // @galaxiahfast - Ejecuta consulta nativa asíncrona hacia la URL especificada.
    const res = await fetch(url);
    return await res.json();
}



// @galaxiahfast - Realiza petición genérica POST.
export async function post(url, data) {

    // @galaxiahfast - Envía parámetros de configuración y cuerpo estructurado en JSON.
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {})
    });
    return await res.json();
}



// @galaxiahfast - Contenedor maestro de peticiones crudas para el catálogo de apartados.
export const ApartadosAPI = {

    // @galaxiahfast - Consulta la colección de registros activos.
    listar: () => get('/api/apartados/listar'),

    // @galaxiahfast - Transmite los datos para registrar un apartado global.
    crear: (payload) => post('/api/apartados/crear', payload),

    // @galaxiahfast - Solicita la baja lógica del registro seleccionado.
    eliminar: (nombreApartado) =>
        post('/api/apartados/eliminar', { nombreApartado }),

    // @galaxiahfast - Solicita la reactivación estructural en la base de datos.
    restaurar: (nombreApartado) =>
        post('/api/apartados/restaurar', { nombreApartado }),

    // @galaxiahfast - Dispara la purga física definitiva del elemento.
    eliminarDefinitivo: (nombreApartado) =>
        post('/api/apartados/eliminar-definitivo', { nombreApartado })
};


