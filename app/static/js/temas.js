


/* ==========================================================================
   @galaxiahfast CONTROL DE TEMA (CLARO / OSCURO)
   ========================================================================== */

/**
 * @galaxiahfast Inicializa el sistema de cambio de tema.
 *
 * Carga el tema almacenado y configura el evento
 * para alternar entre modo claro y oscuro.
 *
 * @returns {void}
 */
function iniciarControlTema() {

    /* @galaxiahfast Obtener elementos principales */
    const botonTema = document.getElementById('theme-toggle');
    const cuerpo = document.body;
    const icono = document.getElementById('theme-icon');

    /* @galaxiahfast Validar elementos requeridos */
    if (!botonTema || !icono) {
        return;
    }

    /* @galaxiahfast Aplicar tema almacenado */
    const temaGuardado = localStorage.getItem('tema') || 'claro';

    cuerpo.setAttribute('data-theme', temaGuardado);

    actualizarIconoTema(
        icono,
        temaGuardado === 'dark'
    );

    /* @galaxiahfast Configurar cambio de tema */
    botonTema.addEventListener('click', (evento) => {

        evento.stopPropagation();

        const esModoOscuro =
            cuerpo.getAttribute('data-theme') === 'dark';

        const nuevoTema =
            esModoOscuro ? 'light' : 'dark';

        cuerpo.setAttribute('data-theme', nuevoTema);

        localStorage.setItem('tema', nuevoTema);

        actualizarIconoTema(icono, esModoOscuro);
    });
}

/**
 * @galaxiahfast Actualiza el icono visual del tema.
 *
 * @param {HTMLElement} elementoIcono
 * Elemento SVG que contiene el icono.
 *
 * @param {boolean} estabaOscuro
 * Indica si el tema anterior era oscuro.
 *
 * @returns {void}
 */
function actualizarIconoTema(elementoIcono, estabaOscuro) {

    /* @galaxiahfast Icono de modo claro */
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

    /* @galaxiahfast Icono de modo oscuro */
    const iconoLuna = `
        <path
            d="M21 12.79A9 9 0 1 1 11.21 3
            7 7 0 0 0 21 12.79z"
        ></path>
    `;

    /* @galaxiahfast Actualizar icono */
    elementoIcono.innerHTML =
        estabaOscuro ? iconoLuna : iconoSol;
}


