// Sistema para mostrar textos, manejo de selección exclusiva, autocierre y lógica contextual
(function() {
    'use strict';
    
    let menuExpandido = false;
    let overlay = null;
    let botonHamburguesa = null;
    let contenedorMenu = null;
    
    // Ruta relativa al servidor Flask (siempre funciona si la carpeta static está en la raíz)
    const RUTA_LOGO = "/static/imagenes/logoMenuPrincipal.png";
    
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
    
    // --- Inserción del logo DENTRO del botón hamburguesa ---
    function insertarLogoEnBoton() {
        if (!botonHamburguesa || botonHamburguesa.querySelector('.logo-en-boton')) return;

        const img = document.createElement('img');
        img.src = RUTA_LOGO;
        img.className = 'logo-en-boton';
        img.style.cssText = 'height: 25px; width: auto; margin-left: 10px; vertical-align: middle; opacity: 0; transition: opacity 0.3s ease;';
        
        const svg = botonHamburguesa.querySelector('svg');
        if (svg) {
            svg.after(img);
        } else {
            botonHamburguesa.appendChild(img);
        }
    }

    function crearOverlay() {
        if (overlay) return;
        overlay = document.createElement('div');
        overlay.className = 'overlay-cierre-menu';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', () => { if (menuExpandido) contraerMenu(); });
    }

    function deseleccionarTodos() {
        if (!contenedorMenu) return;
        contenedorMenu.querySelectorAll('.boton-menu-herramienta').forEach(btn => btn.classList.remove('activo'));
    }

    function configurarClicFuera() {
        document.addEventListener('click', function(e) {
            if (contenedorMenu && !contenedorMenu.contains(e.target) && e.target !== botonHamburguesa && !botonHamburguesa.contains(e.target)) {
                if (menuExpandido) contraerMenu();
                else deseleccionarTodos();
            }
        });
    }
    
    function agregarTextosBotones() {
        const botones = document.querySelectorAll('.contenedor-interno-barra-herramientas .boton-menu-herramienta');
        botones.forEach(boton => {
            if (boton.id === 'botonAlternarExpansionMenuLateralPrincipal') return;
            const texto = textosBotones[boton.id];
            if (texto && !boton.querySelector('.texto-ayuda-boton')) {
                let textoSpan = document.createElement('span');
                textoSpan.className = 'texto-ayuda-boton';
                textoSpan.textContent = texto;
                boton.appendChild(textoSpan);
            }
        });
    }
    
    function eliminarTextosBotones() {
        document.querySelectorAll('.texto-ayuda-boton').forEach(el => el.remove());
    }
    
    function expandirMenu() {
        menuExpandido = true;
        agregarTextosBotones();
        contenedorMenu.setAttribute('data-expandido', 'true');
        
        const logoImg = document.querySelector('.logo-en-boton');
        if (logoImg) logoImg.style.opacity = '1';
        
        if (overlay) overlay.classList.add('activo');
    }
    
    function contraerMenu() {
        menuExpandido = false;
        
        const logoImg = document.querySelector('.logo-en-boton');
        if (logoImg) logoImg.style.opacity = '0';

        document.querySelectorAll('.texto-ayuda-boton').forEach(t => t.style.animation = 'desaparecerTexto 0.15s ease-out forwards');
        setTimeout(() => {
            contenedorMenu.setAttribute('data-expandido', 'false');
            if (overlay) overlay.classList.remove('activo');
            setTimeout(() => { if (!menuExpandido) eliminarTextosBotones(); }, 300);
        }, 50);
    }
    
    function alternarMenu(e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        menuExpandido ? contraerMenu() : expandirMenu();
    }
    
    function configurarManejadorBotones() {
        contenedorMenu.addEventListener('click', function(e) {
            const boton = e.target.closest('.boton-menu-herramienta');
            if (!boton) {
                deseleccionarTodos();
                if (menuExpandido) contraerMenu();
                return;
            }
            if (boton.id === 'botonAlternarExpansionMenuLateralPrincipal') return;
            
            // Botón de cambiar tema: no cierra el menú
            if (boton.id === 'botonAlternarTemaVisualAplicacion') return;
            
            if (boton.classList.contains('activo')) {
                boton.classList.remove('activo');
            } else {
                deseleccionarTodos();
                boton.classList.add('activo');
            }
            
            if (menuExpandido) contraerMenu();
        });
    }
    
    function setup() {
        botonHamburguesa = document.getElementById('botonAlternarExpansionMenuLateralPrincipal');
        contenedorMenu = document.querySelector('.contenedor-barra-herramientas-principal');
        if (!botonHamburguesa || !contenedorMenu) return;
        
        insertarLogoEnBoton();
        crearOverlay();
        configurarManejadorBotones(); 
        configurarClicFuera();
        
        contenedorMenu.setAttribute('data-expandido', 'false');
        
        botonHamburguesa.removeEventListener('click', alternarMenu);
        botonHamburguesa.addEventListener('click', alternarMenu);
        
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuExpandido) contraerMenu(); });
    }
    
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', setup) : setup();
})();