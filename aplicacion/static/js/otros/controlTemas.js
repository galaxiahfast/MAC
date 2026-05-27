/* @galaxiahfast - Inicializa el sistema de cambio de tema. */
function iniciarControlTema() {

    /* @galaxiahfast - Obtener elementos principales. */
    const botonTema = document.getElementById(
        'botonAlternarTemaVisualAplicacion'
    );

    const cuerpo = document.body;

    /* @galaxiahfast - Validar botón requerido. */
    if (!botonTema) {

        console.warn(
            '@galaxiahfast - No se encontró el botón de tema'
        );

        return;
    }

    /* @galaxiahfast - Obtener SVG interno del botón. */
    const icono = botonTema.querySelector('svg');

    if (!icono) {

        console.warn(
            '@galaxiahfast - No se encontró el icono SVG del tema'
        );

        return;
    }

    /* @galaxiahfast - Recuperar tema guardado. */
    const temaGuardado =
        localStorage.getItem('tema') || 'light';

    /* @galaxiahfast - Aplicar tema inicial. */
    cuerpo.setAttribute(
        'data-theme',
        temaGuardado
    );

    /* @galaxiahfast - Actualizar icono inicial. */
    actualizarIconoTema(
        icono,
        temaGuardado === 'dark'
    );

    /* @galaxiahfast - Configurar cambio dinámico de tema. */
    botonTema.addEventListener('click', (evento) => {

        evento.stopPropagation();

        /* @galaxiahfast - Detectar estado actual. */
        const esModoOscuro =
            cuerpo.getAttribute('data-theme') === 'dark';

        /* @galaxiahfast - Definir siguiente tema. */
        const nuevoTema =
            esModoOscuro
                ? 'light'
                : 'dark';

        /* @galaxiahfast - Aplicar nuevo tema. */
        cuerpo.setAttribute(
            'data-theme',
            nuevoTema
        );

        /* @galaxiahfast - Persistir preferencia. */
        localStorage.setItem(
            'tema',
            nuevoTema
        );

        /* @galaxiahfast - Actualizar icono visual. */
        actualizarIconoTema(
            icono,
            nuevoTema === 'dark'
        );
    });
}

/* @galaxiahfast - Actualiza el icono visual del tema activo. */
function actualizarIconoTema(
    elementoIcono,
    modoOscuro
) {

    /* @galaxiahfast - Icono para modo claro. */
    const iconoSol = `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="18.36" x2="5.64" y2="16.92"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    `;

    /* @galaxiahfast - Icono para modo oscuro. */
    const iconoLuna = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    `;

    /* @galaxiahfast - Actualizar SVG dinámicamente. */
    elementoIcono.innerHTML =
        modoOscuro
            ? iconoLuna
            : iconoSol;
}

/* @galaxiahfast - Inicializar sistema al cargar documento. */
document.addEventListener(
    'DOMContentLoaded',
    iniciarControlTema
);