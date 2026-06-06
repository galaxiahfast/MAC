/* @galaxiahfast - Módulo encargado de gestionar la reubicación interactiva de dispositivos en el mapa mediante drag. */
import { moverDispositivoEnMapa } from '../infraestructura/sincronizarDispositivos.js';
import { mostrarNotificacion } from '../otros/sistemaNotificaciones.js';

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

    /* @galaxiahfast - Añade clase de arrastrable a todos los puntos. */
    document.querySelectorAll('.dispositivo-punto').forEach(punto => {
        punto.classList.add('dispositivo-arrastrable');
    });

    mostrarNotificacion('Arrastra un dispositivo para reubicarlo', 'advertencia');
}



/* @galaxiahfast - Desactiva el modo de reubicación de dispositivos en el mapa. */
export function desactivarModoReubicacion() {
    modoReubicacionActivo = false;
    puntoArrastrado = null;
    const mapa = document.getElementById('contenedorMapa');
    if (mapa) mapa.classList.remove('modo-reubicacion-activo');

    /* @galaxiahfast - Remueve clase de arrastrable de todos los puntos. */
    document.querySelectorAll('.dispositivo-punto').forEach(punto => {
        punto.classList.remove('dispositivo-arrastrable');
    });
}



/* @galaxiahfast - Retorna si el modo de reubicación está activo. */
export function esModoReubicacionActivo() {
    return modoReubicacionActivo;
}



/* @galaxiahfast - Inicia el arrastre de un dispositivo del mapa. */
function manejarMouseDown(event) {
    if (!modoReubicacionActivo) return;

    const punto = event.target.closest('.dispositivo-punto');
    if (!punto) return;

    event.preventDefault();
    puntoArrastrado = punto;

    const mapa = document.getElementById('contenedorMapa');
    const rect = mapa.getBoundingClientRect();

    offsetX = event.clientX - punto.getBoundingClientRect().left;
    offsetY = event.clientY - punto.getBoundingClientRect().top;

    punto.classList.add('dispositivo-arrastrando');
    document.body.style.userSelect = 'none';
}



/* @galaxiahfast - Mueve el dispositivo arrastrado siguiendo el cursor. */
function manejarMouseMove(event) {
    if (!puntoArrastrado) return;

    const mapa = document.getElementById('contenedorMapa');
    const rect = mapa.getBoundingClientRect();

    const posX = ((event.clientX - rect.left - offsetX + puntoArrastrado.offsetWidth / 2) / rect.width * 100);
    const posY = ((event.clientY - rect.top - offsetY + puntoArrastrado.offsetHeight / 2) / rect.height * 100);

    /* @galaxiahfast - Limita las coordenadas al rango válido del mapa. */
    const clampX = Math.max(0, Math.min(100, posX));
    const clampY = Math.max(0, Math.min(100, posY));

    puntoArrastrado.style.left = `${clampX}%`;
    puntoArrastrado.style.top = `${clampY}%`;
}



/* @galaxiahfast - Finaliza el arrastre y persiste la nueva posición en el backend. */
function manejarMouseUp(event) {
    if (!puntoArrastrado) return;

    const mapa = document.getElementById('contenedorMapa');
    const rect = mapa.getBoundingClientRect();

    const posX = ((event.clientX - rect.left) / rect.width * 100).toFixed(2) + '%';
    const posY = ((event.clientY - rect.top) / rect.height * 100).toFixed(2) + '%';

    const idDispositivo = parseInt(puntoArrastrado.dataset.id);

    puntoArrastrado.classList.remove('dispositivo-arrastrando');
    document.body.style.userSelect = '';
    puntoArrastrado = null;

    if (idDispositivo) {
        moverDispositivoEnMapa(idDispositivo, posX, posY);
    }
}



/* @galaxiahfast - Inicialización del módulo de reubicación de dispositivos. */
export function inicializarModuloReubicacion() {
    const mapa = document.getElementById('contenedorMapa');
    if (mapa) {
        mapa.addEventListener('mousedown', manejarMouseDown);
        document.addEventListener('mousemove', manejarMouseMove);
        document.addEventListener('mouseup', manejarMouseUp);
    }
}
