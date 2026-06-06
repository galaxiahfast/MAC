/* @galaxiahfast - Módulo encargado de gestionar la visibilidad de dispositivos ocultos en el mapa. */
import { getDispositivos, suscribirseDispositivos } from '../infraestructura/memoriaCacheDispositivos.js';
import { ocultarDispositivoEnMapa } from '../infraestructura/sincronizarDispositivos.js';

/* ==========================================================================
   @galaxiahfast - ESTADO DEL MODO DE VISIBILIDAD
   ========================================================================== */

let mostrandoTodos = false;



/* @galaxiahfast - Alterna la visualización de todos los dispositivos incluyendo los ocultos. */
export function alternarVisibilidadTodos() {
    mostrandoTodos = !mostrandoTodos;
    renderizarDispositivos();
}



/* @galaxiahfast - Retorna si se están mostrando todos los dispositivos (incluyendo ocultos). */
export function estaMostrandoTodos() {
    return mostrandoTodos;
}



/* @galaxiahfast - Oculta o muestra un dispositivo individual al hacer clic en su punto. */
export function toggleVisibilidadIndividual(idDispositivo) {
    ocultarDispositivoEnMapa(idDispositivo);
}



/* @galaxiahfast - Renderiza los puntos de dispositivos en la capa del mapa respetando la visibilidad. */
export function renderizarDispositivos() {
    const capaDispositivos = document.getElementById('capaDispositivos');
    if (!capaDispositivos) return;

    const dispositivos = getDispositivos();
    capaDispositivos.innerHTML = '';

    dispositivos.forEach(dispositivo => {
        // @galaxiahfast - Si no se muestran todos, oculta los dispositivos no visibles.
        if (!mostrandoTodos && !dispositivo.estadoVisible) return;

        const punto = document.createElement('div');
        punto.className = 'punto-dispositivo';
        punto.dataset.idDispositivo = dispositivo.id;

        // @galaxiahfast - Posiciona el punto según las coordenadas almacenadas.
        punto.style.left = dispositivo.posicionX;
        punto.style.top = dispositivo.posicionY;

        // @galaxiahfast - Añade clase visual para dispositivos ocultos cuando se muestran todos.
        if (!dispositivo.estadoVisible) {
            punto.classList.add('punto-dispositivo-oculto');
        }

        // @galaxiahfast - Añade indicador visual con el ID del dispositivo.
        punto.title = `Dispositivo #${dispositivo.id}`;

        capaDispositivos.appendChild(punto);
    });
}



/* @galaxiahfast - Inicialización del módulo de visibilidad y renderizado de dispositivos. */
export function inicializarModuloVisibilidad() {
    // @galaxiahfast - Se suscribe a los cambios de dispositivos para re-renderizar automáticamente.
    suscribirseDispositivos(() => {
        renderizarDispositivos();
    });
}
