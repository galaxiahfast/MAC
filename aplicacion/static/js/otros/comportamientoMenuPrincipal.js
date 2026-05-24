// Sistema para mostrar textos, manejo de selección exclusiva, autocierre y lógica contextual
(function() {
    'use strict';
    
    let menuExpandido = false;
    let overlay = null;
    let botonHamburguesa = null;
    let contenedorMenu = null;
    
    const textosBotones = {
        'botonRegistrarNuevoDispositivoPlano': 'Agregar Dispositivo',
        'botonActivarModoEliminacionDispositivos': 'Eliminar Dispositivo',
        'botonActivarModoEdicionDispositivos': 'Editar Dispositivo',
        'botonActivarModoReubicacionDispositivos': 'Mover Dispositivo',
        'botonAlternarVisibilidadDispositivosRenderizados': 'Ver Dispositivos',
        'botonRegistrarNuevoApartadoGlobalDispositivos': 'Agregar Apartado',
        'botonEliminarApartadosExistentesDispositivos': 'Eliminar Apartado',
        'botonAbrirPanelRestauracionElementosEliminados': 'Papelera',
        'botonAlternarTemaVisualAplicacion': 'Cambiar Tema',
        'botonAbrirConfiguracionGeneralSistema': 'Configuración',
        'botonCerrarSesionUsuarioActualSistema': 'Cerrar Sesión',
        'botonAbrirPerfilUsuarioAutenticadoSistema': 'Mi Perfil'
    };
    
    function crearOverlay() {
        if (overlay) return;
        overlay = document.createElement('div');
        overlay.className = 'overlay-cierre-menu';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', () => { if (menuExpandido) contraerMenu(); });
    }

    function deseleccionarTodos() {
        if (!contenedorMenu) return;
        contenedorMenu.querySelectorAll('.boton-menu-herramienta').forEach(btn => {
            btn.classList.remove('activo');
        });
    }

    // Lógica contextual solicitada
    function configurarClicFuera() {
        document.addEventListener('click', function(e) {
            // Si el clic es fuera del menú
            if (contenedorMenu && !contenedorMenu.contains(e.target) && e.target !== botonHamburguesa) {
                if (menuExpandido) {
                    // Si estaba expandido, cerramos menú PERO conservamos la selección
                    contraerMenu();
                } else {
                    // Si estaba comprimido, deseleccionamos todo
                    deseleccionarTodos();
                }
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
        if (overlay) overlay.classList.add('activo');
    }
    
    function contraerMenu() {
        menuExpandido = false;
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
            
            // Si el clic es en espacio vacío dentro del menú
            if (!boton) {
                deseleccionarTodos();
                if (menuExpandido) contraerMenu();
                return;
            }
            
            if (boton.id === 'botonAlternarExpansionMenuLateralPrincipal') return;
            
            if (boton.id === 'botonAlternarTemaVisualAplicacion') {
                if (menuExpandido) contraerMenu();
                return;
            }
            
            // Selección exclusiva
            if (boton.classList.contains('activo')) {
                boton.classList.remove('activo');
            } else {
                deseleccionarTodos();
                boton.classList.add('activo');
            }
            
            // Si el menú estaba expandido, al hacer clic en un botón, se contrae.
            if (menuExpandido) contraerMenu();
        });
    }
    
    function setup() {
        botonHamburguesa = document.getElementById('botonAlternarExpansionMenuLateralPrincipal');
        contenedorMenu = document.querySelector('.contenedor-barra-herramientas-principal');
        if (!botonHamburguesa || !contenedorMenu) return;
        
        crearOverlay();
        configurarManejadorBotones(); 
        configurarClicFuera();
        
        contenedorMenu.setAttribute('data-expandido', 'false');
        botonHamburguesa.addEventListener('click', alternarMenu);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuExpandido) contraerMenu(); });
    }
    
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', setup) : setup();
})();