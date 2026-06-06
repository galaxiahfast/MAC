/* @galaxiahfast - Módulo encargado de gestionar la lógica de eliminación de dispositivos mediante clic en el mapa. */
import { eliminarDispositivoDelMapa } from '../infraestructura/sincronizarDispositivos.js';

/* ==========================================================================
   @galaxiahfast - ESTADO DEL MODO DE ELIMINACIÓN
   ========================================================================== */

let modoEliminacionActivo = false;



/* @galaxiahfast - Activa el modo de eliminación de dispositivos en el mapa. */
export function activarModoEliminacion() {
    modoEliminacionActivo = true;
    const mapa = document.getElementById('contenedorMapa');
    if (mapa) mapa.classList.add('modo-eliminacion-activo');
}



/* @galaxiahfast - Desactiva el modo de eliminación de dispositivos en el mapa. */
export function desactivarModoEliminacion() {
    modoEliminacionActivo = false;
    const mapa = document.getElementById('contenedorMapa');
    if (mapa) mapa.classList.remove('modo-eliminacion-activo');
}



/* @galaxiahfast - Retorna si el modo de eliminación está activo. */
export function esModoEliminacionActivo() {
    return modoEliminacionActivo;
}



/* @galaxiahfast - Maneja el clic en un punto de dispositivo para eliminarlo del mapa. */
function manejarClicDispositivo(event) {
    if (!modoEliminacionActivo) return;

    // @galaxiahfast - Busca el elemento del dispositivo más cercano al clic.
    const punto = event.target.closest('.punto-dispositivo');
    if (!punto) return;

    event.stopPropagation();

    // @galaxiahfast - Obtiene el identificador del dispositivo desde el atributo data.
    const idDispositivo = parseInt(punto.dataset.idDispositivo);
    if (!idDispositivo) return;

    // @galaxiahfast - Ejecuta la eliminación lógica del dispositivo.
    eliminarDispositivoDelMapa(idDispositivo);
}



/* @galaxiahfast - Inicialización del módulo de eliminación de dispositivos. */
export function inicializarModuloEliminacion() {
    const capaDispositivos = document.getElementById('capaDispositivos');
    if (capaDispositivos) {
        capaDispositivos.addEventListener('click', manejarClicDispositivo);
    }
}
