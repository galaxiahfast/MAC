


/* ==========================================================================
   @galaxiahfast SISTEMA DE NOTIFICACIONES
   ========================================================================== */

/* @galaxiahfast Estado interno del sistema */
let colaNotificaciones = [];
let temporizadorActivo = false;
let esPrimeraDelLote = true;

/* @galaxiahfast Número máximo de notificaciones visibles */
const MAX_NOTIFICACIONES_VISIBLES = 6;

/* @galaxiahfast Etiquetas visuales por tipo */
const TIPOS_TEXTO = {
    exito: "ÉXITO",
    error: "ERROR",
    advertencia: "ADVERTENCIA"
};

/* @galaxiahfast Iconos SVG por tipo */
const ICONOS = {

    exito: `
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

    error: `
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

    advertencia: `
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
};

/**
 * @galaxiahfast Obtiene la hora actual en formato de 12 horas.
 *
 * @returns {string} Hora formateada.
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

    const ampm = horas >= 12 ? 'PM' : 'AM';

    horas = horas % 12;
    horas = horas ? horas : 12;

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
 * @galaxiahfast Procesa la siguiente notificación almacenada en la cola.
 *
 * @returns {void}
 */
function procesarSiguienteNotificacion() {

    /* @galaxiahfast Validar disponibilidad de procesamiento */
    if (colaNotificaciones.length === 0 || temporizadorActivo) {
        return;
    }

    const notificacion = colaNotificaciones[0];

    temporizadorActivo = true;

    /* @galaxiahfast Configurar tiempo de visualización */
    const tiempoVisible = esPrimeraDelLote ? 3000 : 1000;

    esPrimeraDelLote = false;

    /* @galaxiahfast Ejecutar proceso de salida */
    setTimeout(() => {

        /* @galaxiahfast Validar existencia del elemento */
        if (!notificacion.elemento || !notificacion.elemento.isConnected) {
            temporizadorActivo = false;
            procesarSiguienteNotificacion();
            return;
        }

        notificacion.elemento.classList.add('desvanecer');

        /* @galaxiahfast Eliminar notificación y continuar cola */
        setTimeout(() => {

            if (notificacion.elemento?.remove) {
                notificacion.elemento.remove();
            }

            colaNotificaciones.shift();

            temporizadorActivo = false;

            /* @galaxiahfast Reiniciar estado del lote */
            if (colaNotificaciones.length === 0) {
                esPrimeraDelLote = true;
            }

            procesarSiguienteNotificacion();

        }, 400);

    }, tiempoVisible);
}

/**
 * @galaxiahfast Muestra una notificación temporal en pantalla.
 *
 * @param {string} mensaje - Texto de la notificación.
 * @param {"exito"|"error"|"advertencia"} [tipo="advertencia"]
 * Tipo visual de la notificación.
 *
 * @returns {void}
 */
function mostrarNotificacion(mensaje, tipo = "advertencia") {

    /* @galaxiahfast Obtener o crear contenedor */
    let contenedor = document.getElementById('contenedor-notificaciones');

    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'contenedor-notificaciones';
        document.body.appendChild(contenedor);
    }

    /* @galaxiahfast Limitar notificaciones visibles */
    while (contenedor.children.length >= MAX_NOTIFICACIONES_VISIBLES) {

        const notificacionAntigua = contenedor.children[0];

        if (notificacionAntigua) {
            notificacionAntigua.remove();
        }

        /* @galaxiahfast Sincronizar cola interna */
        if (
            colaNotificaciones.length > 0 &&
            colaNotificaciones[0].elemento === notificacionAntigua
        ) {
            colaNotificaciones.shift();
        }

        /* @galaxiahfast Reiniciar estado del lote */
        if (colaNotificaciones.length === 0) {
            esPrimeraDelLote = true;
            temporizadorActivo = false;
        }
    }

    /* @galaxiahfast Crear estructura de notificación */
    const notificacion = document.createElement('div');

    notificacion.className = `notificacion ${tipo}`;

    const mensajeMayusculas = mensaje.toUpperCase();

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
            ${mensajeMayusculas}
        </div>
    `;

    /* @galaxiahfast Insertar y registrar notificación */
    contenedor.appendChild(notificacion);

    colaNotificaciones.push({
        elemento: notificacion,
        mensaje: mensajeMayusculas,
        tipo
    });

    /* @galaxiahfast Iniciar procesamiento */
    if (!temporizadorActivo) {
        procesarSiguienteNotificacion();
    }
}

/**
 * @galaxiahfast Elimina todas las notificaciones activas.
 *
 * @returns {void}
 */
function limpiarTodasLasNotificaciones() {

    const contenedor = document.getElementById('contenedor-notificaciones');

    /* @galaxiahfast Limpiar contenedor */
    if (contenedor) {
        contenedor.innerHTML = '';
    }

    /* @galaxiahfast Reiniciar estado interno */
    colaNotificaciones = [];
    temporizadorActivo = false;
    esPrimeraDelLote = true;
}


