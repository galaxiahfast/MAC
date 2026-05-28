// @galaxiahfast - Sistema de control de tema (light/dark)

function obtenerRoot() {
    return document.documentElement;
}

/* ========================================================================= */
/* ICONOS                                                                    */
/* ========================================================================= */

function iconoSol() {
    return `
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
}

function iconoLuna() {
    return `
        <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79z"></path>
    `;
}

function renderIcono(tema) {
    const boton = document.getElementById('botonAlternarTemaVisualAplicacion');
    if (!boton) return;

    const sol = boton.querySelector('.icono-sol');
    const luna = boton.querySelector('.icono-luna');

    if (!sol || !luna) return;

    const esDark = tema === 'dark';

    sol.style.display = esDark ? 'none' : 'block';
    luna.style.display = esDark ? 'block' : 'none';
}

/* ========================================================================= */
/* CORE DE TEMA                                                             */
/* ========================================================================= */

function aplicarTema(tema) {
    const root = obtenerRoot();

    root.setAttribute('data-theme', tema);
    localStorage.setItem('tema', tema);

    renderIcono(tema);

    if (typeof window.actualizarLogoSegunTema === 'function') {
        window.actualizarLogoSegunTema();
    }
}

/* ========================================================================= */
/* INICIALIZACIÓN                                                           */
/* ========================================================================= */

function iniciarControlTema() {
    const temaGuardado = localStorage.getItem('tema') || 'light';

    // aplica tema inmediatamente
    aplicarTema(temaGuardado);
}

/* ========================================================================= */
/* TOGGLE                                                                   */
/* ========================================================================= */

function alternarTemaVisual() {
    const root = obtenerRoot();

    const actual = root.getAttribute('data-theme') || 'light';
    const nuevo = actual === 'dark' ? 'light' : 'dark';

    aplicarTema(nuevo);
}

/* ========================================================================= */
/* BOOTSTRAP                                                                */
/* ========================================================================= */

document.addEventListener('DOMContentLoaded', iniciarControlTema);

/* ========================================================================= */
/* API GLOBAL                                                               */
/* ========================================================================= */

window.alternarTemaVisual = alternarTemaVisual;