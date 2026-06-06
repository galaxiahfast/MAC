
import { renderIcono } from './comportamientoMenuPrincipal.js';

// @galaxiahfast - Helper que devuelve el elemento raíz del documento (<html>) para manipulación global del DOM.
function obtenerRoot() {
    return document.documentElement;
}

// @galaxiahfast - Aplica el tema global de la aplicación (CSS, persistencia y UI sincronizada).
function aplicarTema(tema) {
    const root = obtenerRoot();
    root.setAttribute('data-theme', tema);
    localStorage.setItem('tema', tema);
    renderIcono(tema);
    if (typeof window.actualizarLogoSegunTema === 'function') {
        window.actualizarLogoSegunTema();
    }
    if (typeof window.actualizarPlanoSegunTema === 'function') {
        window.actualizarPlanoSegunTema(tema);
    }
}

// @galaxiahfast - Alterna el estado del tema entre light y dark basado en el estado actual del DOM.
function alternarTemaVisual() {
    const root = obtenerRoot();
    const actual = root.getAttribute('data-theme') || 'light';
    const nuevo = actual === 'dark' ? 'light' : 'dark';

    aplicarTema(nuevo);
}

// @galaxiahfast - API pública para alternar el tema visual desde la UI.
window.alternarTemaVisual = alternarTemaVisual;

/* @galaxiahfast - Sincroniza el estado inicial del tema desde localStorage.
   Nota: puede parecer redundante frente al script inline del HTML, pero se mantiene
   para asegurar sincronización completa del sistema (UI, iconos y lógica JS) en la carga. */
function iniciarControlTema() {
    const temaGuardado = localStorage.getItem('tema') || 'light';

    aplicarTema(temaGuardado);
}

// @galaxiahfast - Inicializa el sistema de tema al cargar completamente el DOM.
document.addEventListener('DOMContentLoaded', iniciarControlTema);


