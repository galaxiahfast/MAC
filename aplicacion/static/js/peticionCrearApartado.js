


// @galaxiahfast - Módulo de gestión de apartados técnicos para la interfaz administrativa.
async function crearApartado(nombreApartado, valorPredeterminado) {

    // @galaxiahfast - Ejecuta la petición POST de inserción capturando posibles errores.
    try {
        const respuesta = await fetch('/api/apartados/crear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombreApartado,
                valorPredeterminado
            })
        });

        // @galaxiahfast - Lee la respuesta del servidor y la convierte a formato JSON.
        const datos = await respuesta.json();

        // @galaxiahfast - Interrumpe el flujo si la respuesta del servidor no es exitosa.
        if (!respuesta.ok) {
            throw new Error(datos.mensaje || 'Error al crear apartado');
        }

        // @galaxiahfast - Actualiza la colección dinámica en la interfaz de usuario.
        await cargarApartados();
        return datos;

    // @galaxiahfast - Registra el fallo en la consola y notifica al cliente mediante una alerta.
    } catch (error) {
        console.error('[APARTADOS] Error al crear:', error);
        alert(error.message);
    }
}



// @galaxiahfast - Solicita al servidor la lista actualizada de apartados activos.
async function cargarApartados() {

    // @galaxiahfast - Solicita la lista de registros activos a la API.
    try {
        const respuesta = await fetch('/api/apartados/listar');
        const datos = await respuesta.json();

        // @galaxiahfast - Verifica la integridad del estado de éxito devuelto.
        if (datos.estado !== 'exito') {
            throw new Error(datos.mensaje || 'Error al listar apartados');
        }

        // @galaxiahfast - Envía la colección de datos recibida para su maquetación estructural.
        renderizarApartados(datos.apartados);

    // @galaxiahfast - Registra en la consola del navegador cualquier falla de lectura.
    } catch (error) {
        console.error('[APARTADOS] Error al listar:', error);
    }
}



// @galaxiahfast - Construye dinámicamente el HTML de la lista de apartados a partir del arreglo recibido.
function renderizarApartados(apartados) {

    // @galaxiahfast - Recupera el nodo contenedor maestro de la interfaz.
    const contenedor = document.getElementById('listaApartados');

    // @galaxiahfast - Aborta el renderizado si el contenedor objetivo no se encuentra.
    if (!contenedor) return;

    // @galaxiahfast - Purga por completo el contenido HTML previo del elemento.
    contenedor.innerHTML = '';

    // @galaxiahfast - Itera el arreglo construyendo dinámicamente cada nodo de apartado.
    apartados.forEach(apartado => {

        // @galaxiahfast - Crea un nuevo nodo div para cada apartado y le asigna la clase CSS correspondiente.
        const item = document.createElement('div');
        item.className = 'apartado-item';

        // @galaxiahfast - Configura el contenido HTML interno del nodo utilizando template literals para interpolar los datos.
        item.innerHTML = `
            <div class="apartado-info">
                <strong>${apartado.nombreApartado}</strong>
                <small>Default: ${apartado.valorPredeterminado ?? ''}</small>
            </div>
            <div class="apartado-acciones">
                <button onclick="eliminarApartado('${apartado.nombreApartado}')">
                    Eliminar
                </button>
            </div>
        `;

        // @galaxiahfast - Inserta el nodo secundario configurado dentro del contenedor principal.
        contenedor.appendChild(item);
    });
}



// @galaxiahfast - Maneja el evento de envío del formulario de creación de apartado.
async function manejarFormularioApartado(evento) {

    // @galaxiahfast - Evita el comportamiento de recarga nativo del formulario HTML.
    evento.preventDefault();

    // @galaxiahfast - Recupera los valores de texto directamente de los inputs.
    const nombre = document.getElementById('inputNombreApartado').value;
    const valor = document.getElementById('inputValorPredeterminado').value;

    // @galaxiahfast - Valida la presencia obligatoria del parámetro de nombre técnico.
    if (!nombre) {
        alert('Nombre requerido');
        return;
    }

    // @galaxiahfast - Invoca el proceso asíncrono para dar de alta el registro.
    await crearApartado(nombre, valor);

    // @galaxiahfast - Restablece todos los campos del formulario a su estado vacío base.
    evento.target.reset();
}



// @galaxiahfast - Ejecuta la petición de eliminación lógica de un apartado específico.
async function eliminarApartado(nombreApartado) {

    // @galaxiahfast - Solicita la baja lógica enviando el nombre objetivo en el cuerpo JSON.
    try {
        const respuesta = await fetch('/api/apartados/eliminar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombreApartado })
        });
         // @galaxiahfast - Lee la respuesta del servidor y la convierte a formato JSON.
        const datos = await respuesta.json();

        // @galaxiahfast - Evalúa el código HTTP de respuesta para descartar fallos del servidor.
        if (!respuesta.ok) {
            throw new Error(datos.mensaje || 'Error al eliminar');
        }

        // @galaxiahfast - Dispara la recarga de datos para refrescar la lista en pantalla.
        await cargarApartados();

    // @galaxiahfast - Captura excepciones de red o de base de datos mostrando la alerta.
    } catch (error) {
        console.error('[APARTADOS] Error al eliminar:', error);
        alert(error.message);
    }
}



// @galaxiahfast - Configura el punto de entrada para la inicialización de la interfaz de gestión de apartados.
document.addEventListener('DOMContentLoaded', () => {
    
    // @galaxiahfast - Carga los datos iniciales al concluir la construcción del árbol DOM.
    cargarApartados();

    // @galaxiahfast - Vincula de forma segura el escuchador de eventos sobre el formulario.
    const form = document.getElementById('formApartado');
    if (form) {
        form.addEventListener('submit', manejarFormularioApartado);
    }
});


