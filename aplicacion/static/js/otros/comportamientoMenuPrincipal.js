(function () {
    'use strict';

    let menuExpandido = false;

    let overlay = null;
    let botonHamburguesa = null;
    let contenedorMenu = null;

    let scrollContainer = null;
    let scrollbarThumb = null;

    let thumbDragging = false;
    let dragStartY = 0;
    let initialScrollTop = 0;

    /* @galaxiahfast - Logos según el tema visual activo. */
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

    /* @galaxiahfast - Obtener logo correspondiente al tema actual. */
    function obtenerRutaLogoSegunTema() {

        const temaActual =
            document.body.getAttribute('data-theme') || 'light';

        return LOGOS_TEMA[temaActual];
    }

    /* @galaxiahfast - Actualizar logo dinámicamente según el tema. */
    function actualizarLogoSegunTema() {

        const logo = document.querySelector('.logo-en-boton');

        if (!logo) {
            return;
        }

        logo.src = obtenerRutaLogoSegunTema();
    }

    /* @galaxiahfast - Insertar logo visual dentro del botón hamburguesa. */
    function insertarLogoEnBoton() {

        if (
            !botonHamburguesa ||
            botonHamburguesa.querySelector('.logo-en-boton')
        ) {
            return;
        }

        const img = document.createElement('img');

        img.src = obtenerRutaLogoSegunTema();

        img.className = 'logo-en-boton';

        img.style.cssText = `
            height: 25px;
            width: auto;
            vertical-align: middle;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const svg = botonHamburguesa.querySelector('svg');

        if (svg) {
            svg.after(img);
        } else {
            botonHamburguesa.appendChild(img);
        }
    }

    function crearOverlay() {

        if (overlay) {
            return;
        }

        overlay = document.createElement('div');

        overlay.className = 'overlay-cierre-menu';

        document.body.appendChild(overlay);

        overlay.addEventListener('click', () => {

            if (menuExpandido) {
                contraerMenu();
            }
        });
    }

    function deseleccionarTodos() {

        if (!contenedorMenu) {
            return;
        }

        contenedorMenu
            .querySelectorAll('.boton-menu-herramienta')
            .forEach(btn => btn.classList.remove('activo'));
    }

    function configurarClicFuera() {

        document.addEventListener('click', function (e) {

            if (
                contenedorMenu &&
                !contenedorMenu.contains(e.target) &&
                e.target !== botonHamburguesa &&
                !botonHamburguesa.contains(e.target)
            ) {

                if (menuExpandido) {
                    contraerMenu();
                } else {
                    deseleccionarTodos();
                }
            }
        });
    }

    function agregarTextosBotones() {

        const botones = document.querySelectorAll(
            '.contenedor-interno-barra-herramientas .boton-menu-herramienta'
        );

        botones.forEach(boton => {

            if (
                boton.id ===
                'botonAlternarExpansionMenuLateralPrincipal'
            ) {
                return;
            }

            const texto = textosBotones[boton.id];

            if (
                texto &&
                !boton.querySelector('.texto-ayuda-boton')
            ) {

                const textoSpan = document.createElement('span');

                textoSpan.className = 'texto-ayuda-boton';
                textoSpan.textContent = texto;

                boton.appendChild(textoSpan);
            }
        });
    }

    function eliminarTextosBotones() {

        document
            .querySelectorAll('.texto-ayuda-boton')
            .forEach(el => el.remove());
    }

    function expandirMenu() {

        menuExpandido = true;

        agregarTextosBotones();

        contenedorMenu.setAttribute(
            'data-expandido',
            'true'
        );

        const logoImg =
            document.querySelector('.logo-en-boton');

        if (logoImg) {
            logoImg.style.opacity = '1';
        }

        if (overlay) {
            overlay.classList.add('activo');
        }

        actualizarScrollbar();
    }

    function contraerMenu() {

        menuExpandido = false;

        const logoImg =
            document.querySelector('.logo-en-boton');

        if (logoImg) {
            logoImg.style.opacity = '0';
        }

        document
            .querySelectorAll('.texto-ayuda-boton')
            .forEach(t => {

                t.style.animation =
                    'desaparecerTexto 0.15s ease-out forwards';
            });

        setTimeout(() => {

            contenedorMenu.setAttribute(
                'data-expandido',
                'false'
            );

            if (overlay) {
                overlay.classList.remove('activo');
            }

            setTimeout(() => {

                if (!menuExpandido) {
                    eliminarTextosBotones();
                }

            }, 300);

            actualizarScrollbar();

        }, 50);
    }

    function alternarMenu(e) {

        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        menuExpandido
            ? contraerMenu()
            : expandirMenu();
    }

/* @galaxiahfast - Ajuste en el manejador de botones para no cerrar el menú si se abre el panel de gestión. */
function configurarManejadorBotones() {
    contenedorMenu.addEventListener('click', function (e) {
        const boton = e.target.closest('.boton-menu-herramienta');
        if (!boton) {
            deseleccionarTodos();
            if (menuExpandido) contraerMenu();
            return;
        }

        // --- NUEVA LÓGICA DE EXCEPCIÓN ---
        // Si el botón es el de gestión, no contraer el menú inmediatamente
        if (boton.id === 'botonGestionarApartadosGlobales') {
            return; 
        }
        // ---------------------------------

        if (boton.id === 'botonAlternarExpansionMenuLateralPrincipal') return;

        if (boton.id === 'botonAlternarTemaVisualAplicacion') {
            alternarTemaVisual();
            return;
        }

        if (boton.classList.contains('activo')) {
            boton.classList.remove('activo');
        } else {
            deseleccionarTodos();
            boton.classList.add('activo');
        }

        if (menuExpandido) contraerMenu();
    });
}

    /* ==========================================================================
       SCROLLBAR PERSONALIZADO
       ========================================================================== */

    function actualizarScrollbar() {

        if (!scrollContainer || !scrollbarThumb) {
            return;
        }

        const scrollHeight =
            scrollContainer.scrollHeight;

        const clientHeight =
            scrollContainer.clientHeight;

        const scrollTop =
            scrollContainer.scrollTop;

        const ratioVisible =
            clientHeight / scrollHeight;

        const thumbHeight = Math.max(
            ratioVisible * clientHeight,
            50
        );

        const maxThumbTop =
            clientHeight - thumbHeight;

        const thumbTop =
            (scrollTop / (scrollHeight - clientHeight))
            * maxThumbTop;

        scrollbarThumb.style.height =
            `${thumbHeight}px`;

        scrollbarThumb.style.transform =
            `translateY(${thumbTop || 0}px)`;
    }

    function iniciarDragScrollbar(e) {

        thumbDragging = true;

        dragStartY = e.clientY;

        initialScrollTop =
            scrollContainer.scrollTop;

        scrollbarThumb.classList.add('arrastrando');

        document.body.style.userSelect = 'none';
    }

    function moverDragScrollbar(e) {

        if (!thumbDragging) {
            return;
        }

        const deltaY =
            e.clientY - dragStartY;

        const scrollRatio =
            scrollContainer.scrollHeight /
            scrollContainer.clientHeight;

        scrollContainer.scrollTop =
            initialScrollTop + (deltaY * scrollRatio);
    }

    function terminarDragScrollbar() {

        thumbDragging = false;

        scrollbarThumb.classList.remove('arrastrando');

        document.body.style.userSelect = '';
    }

    function configurarScrollbarPersonalizado() {

        scrollContainer =
            document.getElementById(
                'barraHerramientasScroll'
            );

        scrollbarThumb =
            document.getElementById(
                'scrollbarThumb'
            );

        if (!scrollContainer || !scrollbarThumb) {
            return;
        }

        scrollContainer.addEventListener(
            'scroll',
            actualizarScrollbar,
            { passive: true }
        );

        window.addEventListener(
            'resize',
            actualizarScrollbar
        );

        scrollbarThumb.addEventListener(
            'mousedown',
            iniciarDragScrollbar
        );

        document.addEventListener(
            'mousemove',
            moverDragScrollbar
        );

        document.addEventListener(
            'mouseup',
            terminarDragScrollbar
        );

        actualizarScrollbar();
    }

    function setup() {

        botonHamburguesa =
            document.getElementById(
                'botonAlternarExpansionMenuLateralPrincipal'
            );

        contenedorMenu =
            document.querySelector(
                '.contenedor-barra-herramientas-principal'
            );

        if (!botonHamburguesa || !contenedorMenu) {
            return;
        }

        insertarLogoEnBoton();

        crearOverlay();

        configurarManejadorBotones();

        configurarClicFuera();

        configurarScrollbarPersonalizado();

        contenedorMenu.setAttribute(
            'data-expandido',
            'false'
        );

        botonHamburguesa.removeEventListener(
            'click',
            alternarMenu
        );

        botonHamburguesa.addEventListener(
            'click',
            alternarMenu
        );

        document.addEventListener(
            'keydown',
            (e) => {

                if (
                    e.key === 'Escape' &&
                    menuExpandido
                ) {
                    contraerMenu();
                }
            }
        );

        requestAnimationFrame(
            actualizarScrollbar
        );
    }

    /* @galaxiahfast - Exponer función global para controlTemas.js */
    window.actualizarLogoSegunTema =
        actualizarLogoSegunTema;

    if (document.readyState === 'loading') {

        document.addEventListener(
            'DOMContentLoaded',
            setup
        );

    } else {

        setup();
    }

})();

/* @galaxiahfast - SVG del icono de sol utilizado para el tema claro */
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

/* @galaxiahfast - SVG del icono de luna utilizado para el tema oscuro */
function iconoLuna() {
    return `
        <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79z"></path>
    `;
}

/* @galaxiahfast - Sincroniza la visibilidad de los iconos según el tema activo */
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