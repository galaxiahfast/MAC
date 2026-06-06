/* @galaxiahfast - Módulo encargado de gestionar la lógica de creación de nuevos dispositivos en el mapa mediante clic. */
import { crearDispositivoEnMapa } from '../infraestructura/sincronizarDispositivos.js';

/* ==========================================================================
   @galaxiahfast - ESTADO DEL MODO DE COLOCACIÓN
   ========================================================================== */

let modoColocacionActivo = false;



/* @galaxiahfast - Activa el modo de colocación de dispositivos en el mapa. */
export function activarModoColocacion() {
    modoColocacionActivo = true;
    const mapa = document.getElementById('contenedorMapa');
    if (mapa) mapa.classList.add('modo-colocacion-activo');
}



/* @galaxiahfast - Desactiva el modo de colocación de dispositivos en el mapa. */
export function desactivarModoColocacion() {
    modoColocacionActivo = false;
    const mapa = document.getElementById('contenedorMapa');
    if (mapa) mapa.classList.remove('modo-colocacion-activo');
}



/* @galaxiahfast - Retorna si el modo de colocación está activo. */
export function esModoColocacionActivo() {
    return modoColocacionActivo;
}



/* @galaxiahfast - Maneja el clic en el mapa para registrar un nuevo dispositivo en la posición indicada. */
function manejarClicMapa(event) {
    if (!modoColocacionActivo) return;

    const mapa = document.getElementById('contenedorMapa');
    if (!mapa) return;

    // @galaxiahfast - Calcula las coordenadas relativas al contenedor del mapa en porcentaje.
    const rect = mapa.getBoundingClientRect();
    const posicionX = ((event.clientX - rect.left) / rect.width * 100).toFixed(2) + '%';
    const posicionY = ((event.clientY - rect.top) / rect.height * 100).toFixed(2) + '%';

    // @galaxiahfast - Envía la solicitud de creación al servidor.
    crearDispositivoEnMapa(posicionX, posicionY);

    // @galaxiahfast - Desactiva el modo después de colocar un dispositivo.
    desactivarModoColocacion();
}



/* @galaxiahfast - Inicialización del módulo de colocación de dispositivos. */
export function inicializarModuloColocacion() {
    const mapa = document.getElementById('contenedorMapa');
    if (mapa) {
        mapa.addEventListener('click', manejarClicMapa);
    }
}
