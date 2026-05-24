// Sistema para mostrar textos al lado de los botones del menú lateral, manejo de selección exclusiva y autocierre
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
        
        overlay.addEventListener('click', function() {
            if (menuExpandido) {
                contraerMenu();
            }
        });
    }
    
    function agregarTextosBotones() {
        const botones = document.querySelectorAll('.contenedor-interno-barra-herramientas .boton-menu-herramienta');
        
        botones.forEach(boton => {
            if (boton.id === 'botonAlternarExpansionMenuLateralPrincipal') return;
            
            const texto = textosBotones[boton.id];
            if (texto) {
                let textoSpan = boton.querySelector('.texto-ayuda-boton');
                
                if (!textoSpan) {
                    textoSpan = document.createElement('span');
                    textoSpan.className = 'texto-ayuda-boton';
                    textoSpan.textContent = texto;
                    boton.appendChild(textoSpan);
                }
            }
        });
    }
    
    function eliminarTextosBotones() {
        document.querySelectorAll('.texto-ayuda-boton').forEach(el => el.remove());
    }
    
    function expandirMenu() {
        if (!contenedorMenu) return;
        
        menuExpandido = true;
        agregarTextosBotones();
        contenedorMenu.setAttribute('data-expandido', 'true');
        
        if (overlay) {
            overlay.classList.add('activo');
        }
    }
    
    function contraerMenu() {
        if (!contenedorMenu) return;
        
        menuExpandido = false;
        
        const textos = document.querySelectorAll('.texto-ayuda-boton');
        textos.forEach(texto => {
            texto.style.animation = 'desaparecerTexto 0.15s ease-out forwards';
        });
        
        setTimeout(() => {
            contenedorMenu.setAttribute('data-expandido', 'false');
            
            if (overlay) {
                overlay.classList.remove('activo');
            }
            
            setTimeout(() => {
                if (!menuExpandido) {
                    eliminarTextosBotones();
                }
            }, 300);
        }, 50);
    }
    
    function alternarMenu(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (menuExpandido) {
            contraerMenu();
        } else {
            expandirMenu();
        }
    }
    
    /**
     * Maneja la selección EXCLUSIVA de los botones y el autocierre automático.
     */
    function configurarManejadorBotones() {
        contenedorMenu.addEventListener('click', function(e) {
            const boton = e.target.closest('.boton-menu-herramienta');
            
            // Si el clic no fue en un botón, salimos
            if (!boton) return;
            
            // PROTECCIÓN: Si es la hamburguesa O el botón de cambiar tema, NO se marcan de gris
            if (boton.id === 'botonAlternarExpansionMenuLateralPrincipal' || 
                boton.id === 'botonAlternarTemaVisualAplicacion') {
                
                // Aun así, si el menú está expandido, queremos que se cierre al pulsarlos
                if (menuExpandido) {
                    contraerMenu();
                }
                return;
            }
            
            // Si el botón presionado YA estaba activo, lo deseleccionamos al volver a hacerle clic
            if (boton.classList.contains('activo')) {
                boton.classList.remove('activo');
            } else {
                // Primero: Quitamos la clase 'activo' de cualquier otro botón de acción
                contenedorMenu.querySelectorAll('.boton-menu-herramienta').forEach(btn => {
                    btn.classList.remove('activo');
                });
                
                // Segundo: Marcamos el botón actual como el único seleccionado
                boton.classList.add('activo');
            }

            // Tercero: Si el menú está expandido, lo contraemos automáticamente al seleccionar la acción
            if (menuExpandido) {
                contraerMenu();
            }
        });
    }
    
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(setup, 50);
            });
        } else {
            setTimeout(setup, 50);
        }
    }
    
    function setup() {
        botonHamburguesa = document.getElementById('botonAlternarExpansionMenuLateralPrincipal');
        contenedorMenu = document.querySelector('.contenedor-barra-herramientas-principal');
        
        if (!botonHamburguesa || !contenedorMenu) {
            console.warn('Elementos del menú no encontrados');
            return;
        }
        
        crearOverlay();
        configurarManejadorBotones(); 
        
        contenedorMenu.setAttribute('data-expandido', 'false');
        botonHamburguesa.addEventListener('click', alternarMenu);
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menuExpandido) {
                contraerMenu();
            }
        });
    }
    
    init();
})();