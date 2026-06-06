/* @galaxiahfast - Módulo encargado de gestionar la lógica de reubicación de dispositivos en el mapa mediante arrastre. */
import { moverDispositivoEnMapa } from '../infraestructura/sincronizarDispositivos.js';

/* ==========================================================================
   @galaxiahfast - ESTADO DEL MODO DE REUBICACIÓN
   ========================================================================== */

let modoReubicacionActivo = false;
let puntoArrastrado = null;
let offsetX = 0;
let offsetY = 0;



/* @galaxiahfast - Activa el modo de reubicación de dispositivos en el mapa. */
export function activarModoReubicacion() {
    modoReubicacionActivo = true;
    const mapa = document.getElementById('contenedorMapa');
    if (mapa) mapa.classList.add('modo-reubicacion-activo');
}



/* @galaxiahfast - Desactiva el modo de reubicación de dispositivos en el mapa. */
export function desactivarModoReubicacion() {
    modoReubicacionActivo = false;
    puntoArrastrado = null;
    const mapa = document.getElementById('contenedorMapa');
    if (mapa) mapa.classList.remove('modo-reubicacion-activo');
}



/* @galaxiahfast - Retorna si el modo de reubicación está activo. */
export function esModoReubicacionActivo() {
    return modoReubicacionActivo;
}



/* @galaxiahfast - Maneja el inicio del arrastre de un punto de dispositivo. */
function manejarMouseDown(event) {
    if (!modoReubicacionActivo) return;

    const punto = event.target.closest('.punto-dispositivo');
    if (!punto) return;

    event.preventDefault();
    event.stopPropagation();

    puntoArrastrado = punto;

    // @galaxiahfast - Calcula el offset del clic respecto al centro del punto.
    const rect = punto.getBoundingClientRect();
    offsetX = event.clientX - rect.left - rect.width / 2;
    offsetY = event.clientY - rect.top - rect.height / 2;

    punto.classList.add('punto-arrastrando');
    document.body.style.userSelect = 'none';
}



/* @galaxiahfast - Maneja el movimiento durante el arrastre del punto de dispositivo. */
function manejarMouseMove(event) {
    if (!puntoArrastrado || !modoReubicacionActivo) return;

    const mapa = document.getElementById('contenedorMapa');
    if (!mapa) return;

    // @galaxiahfast - Calcula la nueva posición relativa al mapa en porcentaje.
    const rect = mapa.getBoundingClientRect();
    const nuevaX = ((event.clientX - rect.left - offsetX) / rect.width * 100).toFixed(2);
    const nuevaY = ((event.clientY - rect.top - offsetY) / rect.height * 100).toFixed(2);

    // @galaxiahfast - Actualiza la posición visual del punto durante el arrastre.
    puntoArrastrado.style.left = `${nuevaX}%`;
    puntoArrastrado.style.top = `${nuevaY}%`;
}



/* @galaxiahfast - Maneja la finalización del arrastre y persiste la nueva posición. */
function manejarMouseUp(event) {
    if (!puntoArrastrado || !modoReubicacionActivo) return;

    const mapa = document.getElementById('contenedorMapa');
    if (!mapa) return;

    // @galaxiahfast - Calcula la posición final en porcentaje.
    const rect = mapa.getBoundingClientRect();
    const posicionX = ((event.clientX - rect.left - offsetX) / rect.width * 100).toFixed(2) + '%';
    const posicionY = ((event.clientY - rect.top - offsetY) / rect.height * 100).toFixed(2) + '%';

    // @galaxiahfast - Obtiene el identificador del dispositivo desde el atributo data.
    const idDispositivo = parseInt(puntoArrastrado.dataset.idDispositivo);

    puntoArrastrado.classList.remove('punto-arrastrando');
    document.body.style.userSelect = '';
    puntoArrastrado = null;

    // @galaxiahfast - Persiste la nueva posición en el servidor.
    if (idDispositivo) {
        moverDispositivoEnMapa(idDispositivo, posicionX, posicionY);
    }
}



/* @galaxiahfast - Inicialización del módulo de reubicación de dispositivos. */
export function inicializarModuloReubicacion() {
    const capaDispositivos = document.getElementById('capaDispositivos');
    if (capaDispositivos) {
        capaDispositivos.addEventListener('mousedown', manejarMouseDown);
    }
    document.addEventListener('mousemove', manejarMouseMove);
    document.addEventListener('mouseup', manejarMouseUp);
}
