


/*
@galaxiahfast Sistema de notificaciones.

Descripción técnica:
    Este módulo implementa un sistema de notificaciones en cola con renderizado dinámico,
    control de concurrencia, animaciones de salida controlada y gestión de ciclo de vida.

Componentes principales:
    - Configuración de tiempos y límites.
    - Definición de tipos de notificación.
    - Generación de iconografía SVG embebida.
    - Cola de procesamiento secuencial.
    - API pública de emisión y limpieza.

Características:
    - FIFO estricto.
    - Máximo controlado de notificaciones visibles.
    - Animaciones de salida con colapso vertical.
    - Protección contra múltiples temporizadores activos.
    - Manejo defensivo de nodos DOM.
*/

/* @galaxiahfast Configuración general. */
const MAX_NOTIFICACIONES_VISIBLES = 6;
const DURACION_PRIMERA_NOTIFICACION = 3000;
const DURACION_NOTIFICACION_NORMAL = 1000;

/* @galaxiahfast Tiempos de animación. */
const DURACION_REBOTE_SALIDA = 500;
const DURACION_COLAPSO_VERTICAL = 1600;

/* @galaxiahfast Tipos de notificación. */
const TIPOS_NOTIFICACION = Object.freeze({
    EXITO: 'exito',
    ERROR: 'error',
    ADVERTENCIA: 'advertencia'
});

/* @galaxiahfast Etiquetas por tipo. */
const TIPOS_TEXTO = Object.freeze({
    [TIPOS_NOTIFICACION.EXITO]: 'ÉXITO',
    [TIPOS_NOTIFICACION.ERROR]: 'ERROR',
    [TIPOS_NOTIFICACION.ADVERTENCIA]: 'ADVERTENCIA'
});

/* @galaxiahfast Iconos SVG por tipo. */
const ICONOS = Object.freeze({
    [TIPOS_NOTIFICACION.EXITO]: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `,
    [TIPOS_NOTIFICACION.ERROR]: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    `,
    [TIPOS_NOTIFICACION.ADVERTENCIA]: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 9v4M12 17h.01"></path>
            <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"></path>
        </svg>
    `
});

/* @galaxiahfast Estado interno. */
let colaNotificaciones = [];
let temporizadorActivo = false;
let esPrimeraDelLote = true;

/* @galaxiahfast Utilidad de espera asincrónica. */
function esperar(tiempo) {
    return new Promise(resolve => setTimeout(resolve, tiempo));
}

/* @galaxiahfast Obtención de hora actual. */
function obtenerHoraActual() {
    const ahora = new Date();
    let horas = ahora.getHours();

    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    const segundos = ahora.getSeconds().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';

    horas = horas % 12 || 12;

    return `${horas.toString().padStart(2, '0')}:${minutos}:${segundos} ${ampm}`;
}

/* @galaxiahfast Obtención o creación del contenedor DOM. */
function obtenerContenedorNotificaciones() {
    let contenedor = document.getElementById('contenedor-notificaciones');
    if (contenedor) return contenedor;

    contenedor = document.createElement('div');
    contenedor.id = 'contenedor-notificaciones';
    contenedor.setAttribute('aria-live', 'polite');
    contenedor.setAttribute('role', 'status');

    document.body.appendChild(contenedor);
    return contenedor;
}

/* @galaxiahfast Escapa caracteres HTML para prevenir XSS. */
function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

/* @galaxiahfast Creación de notificación. */
function crearElementoNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;

    const mensajeSeguro = escaparHTML(mensaje.toUpperCase());

    notificacion.innerHTML = `
        <div class="notificacion-encabezado">
            <div class="notificacion-encabezado-izquierdo">
                <div class="notificacion-icono">${ICONOS[tipo]}</div>
                <span class="notificacion-tipo">${TIPOS_TEXTO[tipo]}</span>
            </div>
            <span class="notificacion-hora">${obtenerHoraActual()}</span>
        </div>
        <div class="notificacion-cuerpo">${mensajeSeguro}</div>
    `;

    return notificacion;
}

/* @galaxiahfast Ejecución de salida animada. */
async function ejecutarSalidaSuave(elemento) {
    if (!elemento?.isConnected) return;

    const altura = elemento.offsetHeight;
    elemento.style.height = `${altura}px`;

    void elemento.offsetHeight;

    elemento.classList.add('desvanecer');

    await esperar(DURACION_REBOTE_SALIDA);

    elemento.style.height = '0';
    elemento.style.opacity = '0';
    elemento.style.marginBottom = '0';
    elemento.style.borderWidth = '0';

    const cuerpo = elemento.querySelector('.notificacion-cuerpo');
    const encabezado = elemento.querySelector('.notificacion-encabezado');

    if (cuerpo) {
        cuerpo.style.paddingTop = '0';
        cuerpo.style.paddingBottom = '0';
    }

    if (encabezado) {
        encabezado.style.paddingTop = '0';
        encabezado.style.paddingBottom = '0';
    }

    await esperar(DURACION_COLAPSO_VERTICAL);
    elemento.remove();
}

/* @galaxiahfast Procesamiento de cola. */
async function procesarSiguienteNotificacion() {
    if (colaNotificaciones.length === 0 || temporizadorActivo) return;

    temporizadorActivo = true;

    const actual = colaNotificaciones[0];

    const tiempoVisible = esPrimeraDelLote
        ? DURACION_PRIMERA_NOTIFICACION
        : DURACION_NOTIFICACION_NORMAL;

    esPrimeraDelLote = false;

    await esperar(tiempoVisible);

    if (!actual.elemento?.isConnected) {
        colaNotificaciones = colaNotificaciones.filter(i => i.elemento !== actual.elemento);
        temporizadorActivo = false;

        if (colaNotificaciones.length === 0) esPrimeraDelLote = true;

        procesarSiguienteNotificacion();
        return;
    }

    await ejecutarSalidaSuave(actual.elemento);

    colaNotificaciones = colaNotificaciones.filter(i => i.elemento !== actual.elemento);

    temporizadorActivo = false;

    if (colaNotificaciones.length === 0) esPrimeraDelLote = true;

    procesarSiguienteNotificacion();
}

/* @galaxiahfast API pública. */
function mostrarNotificacion(mensaje, tipo = TIPOS_NOTIFICACION.ADVERTENCIA) {
    if (typeof mensaje !== 'string' || mensaje.trim() === '') return;

    const contenedor = obtenerContenedorNotificaciones();

    while (contenedor.children.length >= MAX_NOTIFICACIONES_VISIBLES) {
        const vieja = contenedor.children[0];
        if (vieja) vieja.remove();

        colaNotificaciones = colaNotificaciones.filter(i => i.elemento !== vieja);
    }

    const elemento = crearElementoNotificacion(mensaje, tipo);

    contenedor.appendChild(elemento);

    colaNotificaciones.push({ elemento, mensaje, tipo });

    if (!temporizadorActivo) procesarSiguienteNotificacion();
}

/* @galaxiahfast Limpieza total. */
function limpiarTodasLasNotificaciones() {
    const contenedor = document.getElementById('contenedor-notificaciones');

    if (contenedor) contenedor.innerHTML = '';

    colaNotificaciones = [];
    temporizadorActivo = false;
    esPrimeraDelLote = true;
}


