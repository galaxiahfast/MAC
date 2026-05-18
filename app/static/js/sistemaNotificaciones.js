


/* ==========================================================================
   @galaxiahfast SISTEMA DE NOTIFICACIONES
   ========================================================================== */

/**
 * ==========================================================================
 * CONFIGURACIÓN
 * ==========================================================================
 */

const MAX_NOTIFICACIONES_VISIBLES = 6;

const DURACION_PRIMERA_NOTIFICACION = 3000;

const DURACION_NOTIFICACION_NORMAL = 1000;

/* @galaxiahfast Tiempo del rebote horizontal */
const DURACION_REBOTE_SALIDA = 420;

/* @galaxiahfast Tiempo del colapso vertical */
const DURACION_COLAPSO_VERTICAL = 650;

const TIPOS_NOTIFICACION = Object.freeze({
    EXITO: 'exito',
    ERROR: 'error',
    ADVERTENCIA: 'advertencia'
});

const TIPOS_TEXTO = Object.freeze({
    [TIPOS_NOTIFICACION.EXITO]: 'ÉXITO',
    [TIPOS_NOTIFICACION.ERROR]: 'ERROR',
    [TIPOS_NOTIFICACION.ADVERTENCIA]: 'ADVERTENCIA'
});

const ICONOS = Object.freeze({

    [TIPOS_NOTIFICACION.EXITO]: `
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `,

    [TIPOS_NOTIFICACION.ERROR]: `
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <circle cx="12" cy="12" r="10"></circle>

            <line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
            ></line>

            <line
                x1="12"
                y1="16"
                x2="12.01"
                y2="16"
            ></line>
        </svg>
    `,

    [TIPOS_NOTIFICACION.ADVERTENCIA]: `
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <path d="M12 9v4M12 17h.01"></path>

            <path
                d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"
            ></path>
        </svg>
    `
});

/**
 * ==========================================================================
 * ESTADO
 * ==========================================================================
 */

let colaNotificaciones = [];

let temporizadorActivo = false;

let esPrimeraDelLote = true;

/**
 * ==========================================================================
 * UTILIDADES
 * ==========================================================================
 */

/**
 * @galaxiahfast Espera.
 *
 * @param {number} tiempo
 *
 * @returns {Promise<void>}
 */
function esperar(tiempo) {

    return new Promise((resolve) => {
        setTimeout(resolve, tiempo);
    });
}

/**
 * @galaxiahfast Hora actual.
 *
 * @returns {string}
 */
function obtenerHoraActual() {

    const ahora = new Date();

    let horas = ahora.getHours();

    const minutos = ahora
        .getMinutes()
        .toString()
        .padStart(2, '0');

    const segundos = ahora
        .getSeconds()
        .toString()
        .padStart(2, '0');

    const ampm =
        horas >= 12
            ? 'PM'
            : 'AM';

    horas = horas % 12 || 12;

    return `
        ${horas.toString().padStart(2, '0')}
        :
        ${minutos}
        :
        ${segundos}
        ${ampm}
    `.replace(/\s+/g, ' ').trim();
}

/**
 * @galaxiahfast Obtiene contenedor.
 *
 * @returns {HTMLElement}
 */
function obtenerContenedorNotificaciones() {

    let contenedor =
        document.getElementById(
            'contenedor-notificaciones'
        );

    if (contenedor) {
        return contenedor;
    }

    contenedor =
        document.createElement('div');

    contenedor.id =
        'contenedor-notificaciones';

    contenedor.setAttribute(
        'aria-live',
        'polite'
    );

    contenedor.setAttribute(
        'role',
        'status'
    );

    document.body.appendChild(
        contenedor
    );

    return contenedor;
}

/**
 * ==========================================================================
 * CREACIÓN
 * ==========================================================================
 */

/**
 * @galaxiahfast Crea notificación.
 *
 * @param {string} mensaje
 * @param {string} tipo
 *
 * @returns {HTMLDivElement}
 */
function crearElementoNotificacion(
    mensaje,
    tipo
) {

    const notificacion =
        document.createElement('div');

    notificacion.className =
        `notificacion ${tipo}`;

    notificacion.innerHTML = `
        <div class="notificacion-encabezado">

            <div class="notificacion-encabezado-izquierdo">

                <div class="notificacion-icono">
                    ${ICONOS[tipo]}
                </div>

                <span class="notificacion-tipo">
                    ${TIPOS_TEXTO[tipo]}
                </span>

            </div>

            <span class="notificacion-hora">
                ${obtenerHoraActual()}
            </span>

        </div>

        <div class="notificacion-cuerpo">
            ${mensaje.toUpperCase()}
        </div>
    `;

    return notificacion;
}

/* ==========================================================================
   SALIDA SUAVE
   ========================================================================== */

/**
 * @galaxiahfast Ejecuta salida suave.
 *
 * @param {HTMLElement} elemento
 *
 * @returns {Promise<void>}
 */
async function ejecutarSalidaSuave(
    elemento
) {

    if (!elemento?.isConnected) {
        return;
    }

    /* @galaxiahfast Altura REAL */
    const altura =
        elemento.offsetHeight;

    /* @galaxiahfast Fijar altura */
    elemento.style.height =
        `${altura}px`;

    /* @galaxiahfast Reflow */
    void elemento.offsetHeight;

    /* @galaxiahfast Activar salida */
    elemento.classList.add(
        'desvanecer'
    );

    /* @galaxiahfast Esperar rebote */
    await esperar(
        DURACION_REBOTE_SALIDA
    );

    /* @galaxiahfast Colapso ultra fluido */
    elemento.style.height = '0';

    elemento.style.opacity = '0';

    elemento.style.marginBottom = '0';

    elemento.style.borderWidth = '0';

    const cuerpo =
        elemento.querySelector(
            '.notificacion-cuerpo'
        );

    const encabezado =
        elemento.querySelector(
            '.notificacion-encabezado'
        );

    if (cuerpo) {

        cuerpo.style.paddingTop = '0';

        cuerpo.style.paddingBottom = '0';
    }

    if (encabezado) {

        encabezado.style.paddingTop = '0';

        encabezado.style.paddingBottom = '0';
    }

    /* @galaxiahfast Esperar transición */
    await esperar(
        DURACION_COLAPSO_VERTICAL
    );

    /* @galaxiahfast Eliminar */
    elemento.remove();
}

/**
 * ==========================================================================
 * PROCESAMIENTO
 * ==========================================================================
 */

/**
 * @galaxiahfast Procesa cola.
 *
 * @returns {Promise<void>}
 */
async function procesarSiguienteNotificacion() {

    if (
        colaNotificaciones.length === 0 ||
        temporizadorActivo
    ) {
        return;
    }

    temporizadorActivo = true;

    const notificacionActual =
        colaNotificaciones[0];

    const tiempoVisible =
        esPrimeraDelLote
            ? DURACION_PRIMERA_NOTIFICACION
            : DURACION_NOTIFICACION_NORMAL;

    esPrimeraDelLote = false;

    await esperar(
        tiempoVisible
    );

    if (
        !notificacionActual.elemento ||
        !notificacionActual.elemento.isConnected
    ) {

        colaNotificaciones =
            colaNotificaciones.filter(
                (item) =>
                    item.elemento !==
                    notificacionActual.elemento
            );

        temporizadorActivo = false;

        if (
            colaNotificaciones.length === 0
        ) {
            esPrimeraDelLote = true;
        }

        procesarSiguienteNotificacion();

        return;
    }

    await ejecutarSalidaSuave(
        notificacionActual.elemento
    );

    /* @galaxiahfast Eliminar referencia */
    colaNotificaciones =
        colaNotificaciones.filter(
            (item) =>
                item.elemento !==
                notificacionActual.elemento
        );

    temporizadorActivo = false;

    /* @galaxiahfast Reiniciar lote */
    if (
        colaNotificaciones.length === 0
    ) {
        esPrimeraDelLote = true;
    }

    procesarSiguienteNotificacion();
}

/**
 * ==========================================================================
 * API PÚBLICA
 * ==========================================================================
 */

/**
 * @galaxiahfast Muestra notificación.
 *
 * @param {string} mensaje
 * @param {"exito"|"error"|"advertencia"} [
 *     tipo="advertencia"
 * ]
 *
 * @returns {void}
 */
function mostrarNotificacion(
    mensaje,
    tipo = TIPOS_NOTIFICACION.ADVERTENCIA
) {

    if (
        typeof mensaje !== 'string' ||
        mensaje.trim() === ''
    ) {
        return;
    }

    const contenedor =
        obtenerContenedorNotificaciones();

    /* @galaxiahfast Limitar visibles */
    while (
        contenedor.children.length >=
        MAX_NOTIFICACIONES_VISIBLES
    ) {

        const notificacionAntigua =
            contenedor.children[0];

        if (notificacionAntigua) {
            notificacionAntigua.remove();
        }

        colaNotificaciones =
            colaNotificaciones.filter(
                (item) =>
                    item.elemento !==
                    notificacionAntigua
            );
    }

    const elementoNotificacion =
        crearElementoNotificacion(
            mensaje,
            tipo
        );

    contenedor.appendChild(
        elementoNotificacion
    );

    colaNotificaciones.push({
        elemento: elementoNotificacion,
        mensaje,
        tipo
    });

    if (!temporizadorActivo) {
        procesarSiguienteNotificacion();
    }
}

/**
 * @galaxiahfast Limpia todas.
 *
 * @returns {void}
 */
function limpiarTodasLasNotificaciones() {

    const contenedor =
        document.getElementById(
            'contenedor-notificaciones'
        );

    if (contenedor) {
        contenedor.innerHTML = '';
    }

    colaNotificaciones = [];

    temporizadorActivo = false;

    esPrimeraDelLote = true;
}


