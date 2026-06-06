/* @galaxiahfast - Importaciones corregidas */
import { inicializarModuloRegistro, abrirPanelRegistro, limpiarYRestaurarFormulario as cerrarPanelRegistro } from '../gestionDispositivos/agregarApartado.js';
import { inicializarModuloGestion, abrirPanelGestion, cerrarPanelGestion } from '../gestionDispositivos/gestionApartados.js';
import { inicializarModuloColocacion, activarModoColocacion, desactivarModoColocacion } from '../gestionDispositivos/agregarDispositivo.js';
import { inicializarModuloEliminacion, activarModoEliminacion, desactivarModoEliminacion } from '../gestionDispositivos/eliminarDispositivo.js';
import { inicializarModuloEdicion, activarModoEdicion, desactivarModoEdicion, cerrarPanelEdicion } from '../gestionDispositivos/editarDispositivo.js';
import { inicializarModuloReubicacion, activarModoReubicacion, desactivarModoReubicacion } from '../gestionDispositivos/moverDispositivo.js';
import { inicializarModuloVisibilidad, alternarVisibilidadTodos } from '../gestionDispositivos/visibilidadDispositivos.js';
import { inicializarModuloPapelera, abrirPanelPapelera, cerrarPanelPapelera } from '../gestionDispositivos/papelera.js';

/* @galaxiahfast - Variables de estado y referencias a elementos del DOM. */
let menuExpandido = false;
let overlay = null;
let botonHamburguesa = null;
let contenedorMenu = null;
let scrollContainer = null;
let scrollbarThumb = null;
let thumbDragging = false;
let dragStartY = 0;
let initialScrollTop = 0;
const LOGOS_TEMA = {
    light: '/static/imagenes/logoMenuPrincipalModoClaroSinFondo.png',
    dark: '/static/imagenes/logoMenuPrincipalModoOscuroSinFondo.png'
};
const textosBotones = {
    'botonRegistrarNuevoDispositivoPlano': 'Agregar',
    'botonActivarModoEliminacionDispositivos': 'Eliminar',
    'botonActivarModoEdicionDispositivos': 'Editar',
    'botonActivarModoReubicacionDispositivos': 'Mover',
    'botonAlternarVisibilidadDispositivosRenderizados': 'Ver todos',
    'botonRegistrarNuevoApartadoGlobalDispositivos': 'Agregar Apartado',
    'botonEliminarApartadosExistentesDispositivos': 'Eliminar Apartado',
    'botonAbrirPanelRestauracionElementosEliminados': 'Papelera',
    'botonAlternarTemaVisualAplicacion': 'Cambiar Tema',
    'botonAbrirConfiguracionGeneralSistema': 'Configuración',
    'botonCerrarSesionUsuarioActualSistema': 'Cerrar Sesión',
    'botonAbrirPerfilUsuarioAutenticadoSistema': 'Mi Perfil'
};

/* ==========================================================================
    @galaxiahfast - LÓGICA DE GESTIÓN DEL MENÚ (Expandir/Contraer).
    ========================================================================== */

/* @galaxiahfast - Expande el menú lateral principal. */
function expandirMenu() {
    menuExpandido = true;
    agregarTextosBotones();
    contenedorMenu.setAttribute('data-expandido', 'true');
    const logoImg = document.querySelector('.logo-en-boton');
    if (logoImg) logoImg.style.opacity = '1';
    if (overlay) overlay.classList.add('activo');
    actualizarScrollbar();
}

/* @galaxiahfast - Contrae el menú lateral principal. */
function contraerMenu() {
    menuExpandido = false;
    const logoImg = document.querySelector('.logo-en-boton');
    if (logoImg) logoImg.style.opacity = '0';
    document.querySelectorAll('.texto-ayuda-boton').forEach(t => {
        t.style.animation = 'desaparecerTexto 0.15s ease-out forwards';
    });
    setTimeout(() => {
        contenedorMenu.setAttribute('data-expandido', 'false');
        if (overlay) overlay.classList.remove('activo');
        setTimeout(() => {
            if (!menuExpandido) eliminarTextosBotones();
        }, 300);
        actualizarScrollbar();
    }, 50);
}

/* @galaxiahfast - Alterna el estado de expansión del menú. */
function alternarMenu(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    menuExpandido ? contraerMenu() : expandirMenu();
}

/* ==========================================================================
    @galaxiahfast - CONTROLADOR CENTRAL DE ACCIONES.
    ========================================================================== */

/* @galaxiahfast - Escucha los eventos de clic centralizados y ejecuta la lógica según el ID del botón. */
function configurarControladorCentral() {
    window.removeEventListener('app:solicitar-accion', manejarAccion);
    window.addEventListener('app:solicitar-accion', manejarAccion);
}

/* @galaxiahfast - Manejador de la lógica centralizada de los botones. */
function manejarAccion(e) {
    const { idBoton } = e.detail;
    if (idBoton === 'botonAlternarTemaVisualAplicacion') {
        if (typeof window.alternarTemaVisual === 'function') {
            window.alternarTemaVisual();
        }
        return; 
    }
    cerrarTodosLosPaneles();
    desactivarTodosLosModos();
    switch (idBoton) {
        case 'botonRegistrarNuevoApartadoGlobalDispositivos':
            abrirPanelRegistro();
            break;
        case 'botonEliminarApartadosExistentesDispositivos':
            abrirPanelGestion();
            break;
        case 'botonRegistrarNuevoDispositivoPlano':
            activarModoColocacion();
            break;
        case 'botonActivarModoEliminacionDispositivos':
            activarModoEliminacion();
            break;
        case 'botonActivarModoEdicionDispositivos':
            activarModoEdicion();
            break;
        case 'botonActivarModoReubicacionDispositivos':
            activarModoReubicacion();
            break;
        case 'botonAlternarVisibilidadDispositivosRenderizados':
            alternarVisibilidadTodos();
            break;
        case 'botonAbrirPanelRestauracionElementosEliminados':
            abrirPanelPapelera();
            break;
    }
}

/* @galaxiahfast - Función para cerrar todos los paneles de forma centralizada. */
function cerrarTodosLosPaneles() {
    cerrarPanelRegistro();
    cerrarPanelGestion();
    cerrarPanelEdicion();
    cerrarPanelPapelera();
    document.getElementById('botonRegistrarNuevoApartadoGlobalDispositivos')?.classList.remove('activo');
    document.getElementById('botonEliminarApartadosExistentesDispositivos')?.classList.remove('activo');
    document.getElementById('botonAbrirPanelRestauracionElementosEliminados')?.classList.remove('activo');
}

/* @galaxiahfast - Desactiva todos los modos interactivos del mapa de forma centralizada. */
function desactivarTodosLosModos() {
    desactivarModoColocacion();
    desactivarModoEliminacion();
    desactivarModoEdicion();
    desactivarModoReubicacion();
}

/* ==========================================================================
    @galaxiahfast - GESTIÓN DE EVENTOS Y CLICS.
    ========================================================================== */

/* @galaxiahfast - Gestiona los clics en los botones del menú y dispara eventos personalizados para que otros módulos escuchen las acciones solicitadas. */
function configurarManejadorBotones() {
    contenedorMenu.removeEventListener('click', manejoClicMenu);
    contenedorMenu.addEventListener('click', manejoClicMenu);
}

/* @galaxiahfast - Lógica delegada del clic en el menú. */
function manejoClicMenu(e) {
    const boton = e.target.closest('.boton-menu-herramienta');
    if (!boton) {
        cerrarTodosLosPaneles();
        deseleccionarTodos();
        if (menuExpandido) contraerMenu();
        return;
    }
    if (boton.id === 'botonAlternarExpansionMenuLateralPrincipal') return;
    const eventoPersonalizado = new CustomEvent('app:solicitar-accion', {
        detail: { idBoton: boton.id, elementoBoton: boton }
    });
    window.dispatchEvent(eventoPersonalizado);
    const botonesQueAbrenPaneles = [
        'botonRegistrarNuevoApartadoGlobalDispositivos',
        'botonEliminarApartadosExistentesDispositivos',
        'botonAbrirPanelRestauracionElementosEliminados'
    ];
    const botonesQueCambianModo = [
        'botonRegistrarNuevoDispositivoPlano',
        'botonActivarModoEliminacionDispositivos',
        'botonActivarModoEdicionDispositivos',
        'botonActivarModoReubicacionDispositivos',
        'botonAlternarVisibilidadDispositivosRenderizados'
    ];
    if (botonesQueAbrenPaneles.includes(boton.id) || botonesQueCambianModo.includes(boton.id)) {
        deseleccionarTodos();
        boton.classList.add('activo');
    }
    if (menuExpandido && boton.id !== 'botonAlternarTemaVisualAplicacion') contraerMenu();
}

/* @galaxiahfast - Configura el cierre centralizado de forma jerárquica */
function configurarClicFuera() {
    document.addEventListener('click', function (e) {
        const clicEnMenu = contenedorMenu && contenedorMenu.contains(e.target);
        const clicEnFormulario = e.target.closest('.panel-formulario-activo');
        if (clicEnMenu) {
            if (menuExpandido && !e.target.closest('.boton-menu-herramienta')) {
                contraerMenu();
            }
            return;
        }
        if (clicEnFormulario) {
            if (menuExpandido) contraerMenu();
            return;
        }
        if (menuExpandido){
            contraerMenu();
            return;
        }
        cerrarTodosLosPaneles();
        deseleccionarTodos();
    });
}

/* @galaxiahfast - Quita la clase activo de todos los botones. */
function deseleccionarTodos() {
    if (!contenedorMenu) return;
    contenedorMenu.querySelectorAll('.boton-menu-herramienta').forEach(btn => btn.classList.remove('activo'));
}

/* ==========================================================================
    @galaxiahfast - GESTIÓN DEL LOGO Y TEMA.
    ========================================================================== */

/* @galaxiahfast - Obtiene la ruta del logo según el tema actual. */
function obtenerRutaLogoSegunTema() {
    const temaActual = document.body.getAttribute('data-theme') || 'light';
    return LOGOS_TEMA[temaActual];
}

/* @galaxiahfast - Actualiza el src del logo dinámicamente. */
function actualizarLogoSegunTema() {
    const logo = document.querySelector('.logo-en-boton');
    if (!logo) return;
    logo.src = obtenerRutaLogoSegunTema();
}

/* @galaxiahfast - Inserta el elemento img del logo en el botón. */
function insertarLogoEnBoton() {
    if (!botonHamburguesa || botonHamburguesa.querySelector('.logo-en-boton')) return;
    const img = document.createElement('img');
    img.src = obtenerRutaLogoSegunTema();
    img.className = 'logo-en-boton';
    img.style.cssText = `height: 25px; width: auto; vertical-align: middle; opacity: 0; transition: opacity 0.3s ease;`;
    const svg = botonHamburguesa.querySelector('svg');
    svg ? svg.after(img) : botonHamburguesa.appendChild(img);
}

/* ==========================================================================
    @galaxiahfast - GESTIÓN DE ETIQUETAS Y OVERLAY.
    ========================================================================== */

/* @galaxiahfast - Añade las etiquetas de texto a los botones. */
function agregarTextosBotones() {
    const botones = document.querySelectorAll('.contenedor-interno-barra-herramientas .boton-menu-herramienta');
    botones.forEach(boton => {
        if (boton.id === 'botonAlternarExpansionMenuLateralPrincipal') return;
        const texto = textosBotones[boton.id];
        if (texto && !boton.querySelector('.texto-ayuda-boton')) {
            const textoSpan = document.createElement('span');
            textoSpan.className = 'texto-ayuda-boton';
            textoSpan.textContent = texto;
            boton.appendChild(textoSpan);
        }
    });
}

/* @galaxiahfast - Elimina las etiquetas de texto de los botones. */
function eliminarTextosBotones() {
    document.querySelectorAll('.texto-ayuda-boton').forEach(el => el.remove());
}

/* @galaxiahfast - Crea el elemento overlay para cierre táctil. */
function crearOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'overlay-cierre-menu';
    document.body.appendChild(overlay);
}

/* ==========================================================================
    @galaxiahfast - GESTIÓN DE SCROLLBAR PERSONALIZADO.
    ========================================================================== */

/* @galaxiahfast - Calcula y actualiza la posición del scrollbar. */
function actualizarScrollbar() {
    if (!scrollContainer || !scrollbarThumb) return;
    const { scrollHeight, clientHeight, scrollTop } = scrollContainer;
    const ratioVisible = clientHeight / scrollHeight;
    const thumbHeight = Math.max(ratioVisible * clientHeight, 50);
    const maxThumbTop = clientHeight - thumbHeight;
    const thumbTop = (scrollTop / (Math.max(scrollHeight - clientHeight, 1))) * maxThumbTop;
    scrollbarThumb.style.height = `${thumbHeight}px`;
    scrollbarThumb.style.transform = `translateY(${thumbTop || 0}px)`;
}

/* @galaxiahfast - Inicia el arrastre del scrollbar. */
function iniciarDragScrollbar(e) {
    thumbDragging = true;
    dragStartY = e.clientY;
    initialScrollTop = scrollContainer.scrollTop;
    scrollbarThumb.classList.add('arrastrando');
    document.body.style.userSelect = 'none';
}

/* @galaxiahfast - Ejecuta el movimiento durante el arrastre. */
function moverDragScrollbar(e) {
    if (!thumbDragging) return;
    const deltaY = e.clientY - dragStartY;
    const scrollRatio = scrollContainer.scrollHeight / scrollContainer.clientHeight;
    scrollContainer.scrollTop = initialScrollTop + (deltaY * scrollRatio);
}

/* @galaxiahfast - Finaliza el arrastre del scrollbar. */
function terminarDragScrollbar() {
    thumbDragging = false;
    scrollbarThumb.classList.remove('arrastrando');
    document.body.style.userSelect = '';
}

/* @galaxiahfast - Inicializa eventos del scrollbar personalizado. */
function configurarScrollbarPersonalizado() {
    scrollContainer = document.getElementById('barraHerramientasScroll');
    scrollbarThumb = document.getElementById('scrollbarThumb');
    if (!scrollContainer || !scrollbarThumb) return;
    scrollContainer.addEventListener('scroll', actualizarScrollbar, { passive: true });
    window.addEventListener('resize', actualizarScrollbar);
    scrollbarThumb.addEventListener('mousedown', iniciarDragScrollbar);
    document.addEventListener('mousemove', moverDragScrollbar);
    document.addEventListener('mouseup', terminarDragScrollbar);
    setTimeout(actualizarScrollbar, 300);
}

/* ==========================================================================
    @galaxiahfast - INICIALIZACIÓN.
    ========================================================================== */

/* @galaxiahfast - Inicializa todos los componentes del módulo. */
function setup() {
    botonHamburguesa = document.getElementById('botonAlternarExpansionMenuLateralPrincipal');
    contenedorMenu = document.querySelector('.contenedor-barra-herramientas-principal');
    if (!botonHamburguesa || !contenedorMenu) return;
    insertarLogoEnBoton();
    crearOverlay();
    configurarManejadorBotones();
    configurarClicFuera();
    configurarScrollbarPersonalizado();
    configurarControladorCentral();
    inicializarModuloRegistro();
    inicializarModuloGestion();
    inicializarModuloColocacion();
    inicializarModuloEliminacion();
    inicializarModuloEdicion();
    inicializarModuloReubicacion();
    inicializarModuloVisibilidad();
    inicializarModuloPapelera();
    contenedorMenu.setAttribute('data-expandido', 'false');
    botonHamburguesa.removeEventListener('click', alternarMenu);
    botonHamburguesa.addEventListener('click', alternarMenu);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuExpandido) contraerMenu();
    });
    requestAnimationFrame(actualizarScrollbar);
}
window.actualizarLogoSegunTema = actualizarLogoSegunTema;
document.readyState === 'loading' 
    ? document.addEventListener('DOMContentLoaded', setup) 
    : setup();

/* ==========================================================================
   @galaxiahfast - UTILIDADES DE ICONOS (GLOBALES).
   ========================================================================== */

/* @galaxiahfast - Retorna el SVG del icono de sol. */
function iconoSol() {
    return `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="18.36" x2="5.64" y2="16.92"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
}

/* @galaxiahfast - Retorna el SVG del icono de luna. */
function iconoLuna() {
    return `<path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79z"></path>`;
}

/* @galaxiahfast - Función exportada para ser usada en otros archivos */
export function renderIcono(tema) {
    const boton = document.getElementById('botonAlternarTemaVisualAplicacion');
    if (!boton) return;
    const sol = boton.querySelector('.icono-sol');
    const luna = boton.querySelector('.icono-luna');
    if (!sol || !luna) return;
    const esDark = tema === 'dark';
    sol.style.display = esDark ? 'none' : 'block';
    luna.style.display = esDark ? 'block' : 'none';
}