


import { getApartados, suscribirse } from './memoriaCache.js';
import { eliminarApartado } from './sincronizarApartados.js';



// @galaxiahfast - Renderiza la lista de apartados activos.
function render() {

    // @galaxiahfast - Recupera el contenedor maestro y limpia el contenido HTML previo si existe.
    const contenedor = document.getElementById('listaApartadosActivos');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    // @galaxiahfast - Filtra la colección de la caché local omitiendo los registros con baja lógica.
    const apartados = getApartados().filter(a => !a.estadoEliminado);

    // @galaxiahfast - Itera los apartados activos construyendo sus nodos y vinculando el evento de borrado.
    apartados.forEach(a => {
        const div = document.createElement('div');
        div.innerHTML = `
            <span>${a.nombreApartado}</span>
            <button data-id="${a.nombreApartado}">
                Eliminar
            </button>
        `;
        div.querySelector('button').addEventListener('click', async () => {
            await eliminarApartado(a.nombreApartado);
        });
        contenedor.appendChild(div);
    });
}



// @galaxiahfast - Se suscribe a cambios del estado global.
suscribirse(render);


