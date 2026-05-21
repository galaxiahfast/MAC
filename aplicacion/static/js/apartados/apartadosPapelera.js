


import {
    getApartados,
    suscribirse
} from './memoriaCache.js';
import {
    restaurarApartado,
    eliminarApartadoDefinitivo
} from './sincronizarApartados.js';



// @galaxiahfast - Renderiza apartados eliminados lógicamente.
function renderTrash() {

    // @galaxiahfast - Recupera el contenedor de la papelera y limpia el contenido previo si existe.
    const contenedor = document.getElementById('listaApartadosEliminados');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    // @galaxiahfast - Filtra la colección de la caché obteniendo únicamente los registros con baja lógica.
    const eliminados = getApartados().filter(a => a.estadoEliminado);

    // @galaxiahfast - Itera los elementos eliminados estructurando sus botones y vinculando sus acciones asíncronas.
    eliminados.forEach(a => {
        const div = document.createElement('div');
        div.innerHTML = `
            <span>${a.nombreApartado}</span>
            <button>Restaurar</button>
            <button>Eliminar definitivo</button>
        `;
        const [btnRestaurar, btnEliminar] = div.querySelectorAll('button');
        btnRestaurar.addEventListener('click', async () => {
            await restaurarApartado(a.nombreApartado);
        });
        btnEliminar.addEventListener('click', async () => {
            await eliminarApartadoDefinitivo(a.nombreApartado);
        });
        contenedor.appendChild(div);
    });
}



// @galaxiahfast - Suscripción reactiva al estado global.
suscribirse(renderTrash);


