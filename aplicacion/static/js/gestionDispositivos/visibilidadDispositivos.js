/* @galaxiahfast - Módulo encargado de gestionar la visibilidad de dispositivos en el mapa y su renderizado reactivo. */
import { getDispositivos, suscribirseDispositivos } from '../infraestructura/memoriaCacheDispositivos.js';
import { ocultarDispositivoEnMapa } from '../infraestructura/sincronizarDispositivos.js';
import { mostrarNotificacion } from '../otros/sistemaNotificaciones.js';

/* ==========================================================================
   @galaxiahfast - ESTADO DE VISIBILIDAD
   ========================================================================== */

let mostrandoTodos = false;



/* @galaxiahfast - Alterna el estado global de visibilidad de dispositivos ocultos. */
export function alternarVisibilidadTodos() {
    mostrandoTodos = !mostrandoTodos;

    if (mostrandoTodos) {
        mostrarNotificacion('Mostrando todos los dispositivos (incluyendo ocultos)', 'advertencia');
    }

    renderizarDispositivosEnMapa();
}



/* @galaxiahfast - Renderiza los dispositivos como puntos SVG en la capa del mapa según su estado. */
function renderizarDispositivosEnMapa() {
    const capa = document.getElementById('capaDispositivos');
    if (!capa) return;

    capa.innerHTML = '';

    const dispositivos = getDispositivos();

    dispositivos.forEach(dispositivo => {
        /* @galaxiahfast - Filtra dispositivos ocultos si no se está mostrando todo. */
        if (!mostrandoTodos && !dispositivo.estadoVisible) return;

        const punto = document.createElement('div');
        punto.className = 'dispositivo-punto';
        punto.dataset.id = dispositivo.id;
        punto.style.left = dispositivo.posicionX;
        punto.style.top = dispositivo.posicionY;
        punto.style.position = 'absolute';

        /* @galaxiahfast - Estilo semitransparente para dispositivos ocultos cuando se muestran todos. */
        if (!dispositivo.estadoVisible) {
            punto.classList.add('dispositivo-oculto');
        }

        /* @galaxiahfast - Icono SVG del punto del dispositivo. */
        punto.innerHTML = `
            <svg class="dispositivo-punto-svg" width="20" height="20" viewBox="0 0 24 24" fill="var(--dispositivo-punto-color, #4a90d9)" stroke="var(--dispositivo-punto-borde, #2c5f8a)" stroke-width="2">
                <circle cx="12" cy="12" r="8"></circle>
            </svg>
        `;

        /* @galaxiahfast - Tooltip con información básica del dispositivo al hacer hover. */
        punto.addEventListener('mouseenter', () => {
            let tooltip = punto.querySelector('.dispositivo-tooltip-info');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'dispositivo-tooltip-info';
                const detallesTexto = (dispositivo.detalles || []).slice(0, 3).map(d => `${d.nombreApartado}: ${d.valorDetalle || d.valorPredeterminado || '—'}`).join('\n');
                tooltip.textContent = `#${dispositivo.id}${detallesTexto ? '\n' + detallesTexto : ''}`;
                punto.appendChild(tooltip);
            }
        });

        punto.addEventListener('mouseleave', () => {
            const tooltip = punto.querySelector('.dispositivo-tooltip-info');
            if (tooltip) tooltip.remove();
        });

        capa.appendChild(punto);
    });
}



/* @galaxiahfast - Inicialización del módulo de visibilidad de dispositivos. */
export function inicializarModuloVisibilidad() {
    /* @galaxiahfast - Suscripción reactiva: re-renderiza el mapa cada vez que cambian los dispositivos en la caché. */
    suscribirseDispositivos(() => {
        renderizarDispositivosEnMapa();
    });

    /* @galaxiahfast - Renderiza una vez cuando los datos están listos. */
    window.addEventListener('app:datos-listos', renderizarDispositivosEnMapa);
}
