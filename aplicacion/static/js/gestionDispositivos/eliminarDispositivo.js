/* @galaxiahfast - Módulo encargado de gestionar la eliminación interactiva de dispositivos en el mapa. */
import { eliminarDispositivoDelMapa } from '../infraestructura/sincronizarDispositivos.js';
import { mostrarNotificacion } from '../otros/sistemaNotificaciones.js';

/* ==========================================================================
   @galaxiahfast - ESTADO DEL MODO DE ELIMINACIÓN
   ========================================================================== */

let modoEliminacionActivo = false;



/* @galaxiahfast - Activa el modo de eliminación de dispositivos en el mapa. */
export function activarModoEliminacion() {
    modoEliminacionActivo = true;
    const mapa = document.getElementById('contenedorMapa');
    if (mapa) mapa.classList.add('modo-eliminacion-activo');

    /* @galaxiahfast - Añade iconos de X a todos los dispositivos del mapa. */
    document.querySelectorAll('.dispositivo-punto').forEach(punto => {
        if (!punto.querySelector('.dispositivo-icono-eliminar')) {
            const iconoX = document.createElement('div');
            iconoX.className = 'dispositivo-icono-eliminar';
            iconoX.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
            punto.appendChild(iconoX);
        }
    });

    mostrarNotificacion('Haz clic en un dispositivo para eliminarlo', 'advertencia');
}



/* @galaxiahfast - Desactiva el modo de eliminación de dispositivos en el mapa. */
export function desactivarModoEliminacion() {
    modoEliminacionActivo = false;
    const mapa = document.getElementById('contenedorMapa');
    if (mapa) mapa.classList.remove('modo-eliminacion-activo');

    /* @galaxiahfast - Remueve todos los iconos de X de los dispositivos. */
    document.querySelectorAll('.dispositivo-icono-eliminar').forEach(icono => icono.remove());
}



/* @galaxiahfast - Retorna si el modo de eliminación está activo. */
export function esModoEliminacionActivo() {
    return modoEliminacionActivo;
}



/* @galaxiahfast - Maneja el clic en un dispositivo del mapa para eliminarlo con confirmación. */
function manejarClicDispositivo(event) {
    if (!modoEliminacionActivo) return;

    const punto = event.target.closest('.dispositivo-punto');
    if (!punto) return;

    event.stopPropagation();

    const idDispositivo = parseInt(punto.dataset.id);
    if (!idDispositivo) return;

    /* @galaxiahfast - Confirmación de seguridad antes de ejecutar la eliminación. */
    if (confirm('¿Eliminar este dispositivo? Se moverá a la papelera.')) {
        eliminarDispositivoDelMapa(idDispositivo);
    }
}



/* @galaxiahfast - Inicialización del módulo de eliminación de dispositivos. */
export function inicializarModuloEliminacion() {
    const mapa = document.getElementById('contenedorMapa');
    if (mapa) {
        mapa.addEventListener('click', manejarClicDispositivo);
    }
}
