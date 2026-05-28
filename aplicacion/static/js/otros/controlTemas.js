/* @galaxiahfast - Inicializa el sistema de tema (solo estado inicial). */
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

    /* @galaxiahfast - Actualizar logo inicial según tema. */
    if (
        typeof window.actualizarLogoSegunTema === 'function'
    ) {

        window.actualizarLogoSegunTema();
    }
}


/* ==========================================================================
   API PÚBLICA DEL MÓDULO (SE USA DESDE EL MENÚ)
   ========================================================================== */

/* @galaxiahfast - Alterna entre light y dark mode. */
function alternarTemaVisual() {

    const cuerpo = document.body;

    const temaActual =
        cuerpo.getAttribute('data-theme') || 'light';

    const nuevoTema =
        temaActual === 'dark'
            ? 'light'
            : 'dark';

    /* @galaxiahfast - Aplicar nuevo tema al body. */
    cuerpo.setAttribute(
        'data-theme',
        nuevoTema
    );

    /* @galaxiahfast - Persistir preferencia visual. */
    localStorage.setItem(
        'tema',
        nuevoTema
    );

    /* @galaxiahfast - Actualizar iconografía visual. */
    actualizarIconoTemaGlobal(nuevoTema);

    /* @galaxiahfast - Actualizar logo dinámico del menú. */
    if (
        typeof window.actualizarLogoSegunTema === 'function'
    ) {

        window.actualizarLogoSegunTema();
    }
}


/* @galaxiahfast - Actualiza icono del botón de tema. */
function actualizarIconoTemaGlobal(tema) {

    const botonTema = document.getElementById(
        'botonAlternarTemaVisualAplicacion'
    );

    if (!botonTema) {
        return;
    }

    const icono = botonTema.querySelector('svg');

    if (!icono) {
        return;
    }

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

    const iconoLuna = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    `;

    icono.innerHTML =
        tema === 'dark'
            ? iconoLuna
            : iconoSol;
}


/* @galaxiahfast - Compatibilidad inicial con carga previa. */
function actualizarIconoTema(icono, esModoOscuro) {

    if (!icono) {
        return;
    }

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

    const iconoLuna = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    `;

    icono.innerHTML =
        esModoOscuro
            ? iconoLuna
            : iconoSol;
}


/* @galaxiahfast - Inicializar sistema al cargar documento. */
document.addEventListener(
    'DOMContentLoaded',
    iniciarControlTema
);