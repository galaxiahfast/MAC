// Sistema para mostrar textos al lado de los botones del menú lateral
(function() {
    'use strict';
    
    let menuExpandido = false;
    let overlay = null;
    let botonHamburguesa = null;
    let contenedorMenu = null;
    
    const textosBotones = {
        'botonRegistrarNuevoDispositivoPlano': 'Agregar dispositivo',
        'botonActivarModoEliminacionDispositivos': 'Eliminar dispositivo',
        'botonActivarModoEdicionDispositivos': 'Editar dispositivo',
        'botonActivarModoReubicacionDispositivos': 'Mover dispositivo',
        'botonAlternarVisibilidadDispositivosRenderizados': 'Ver dispositivos',
        'botonRegistrarNuevoApartadoGlobalDispositivos': 'Agregar apartado',
        'botonEliminarApartadosExistentesDispositivos': 'Eliminar apartado',
        'botonAbrirPanelRestauracionElementosEliminados': 'Papelera',
        'botonAlternarTemaVisualAplicacion': 'Cambiar tema',
        'botonAbrirConfiguracionGeneralSistema': 'Configuración',
        'botonCerrarSesionUsuarioActualSistema': 'Cerrar sesión',
        'botonAbrirPerfilUsuarioAutenticadoSistema': 'Mi perfil'
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
        
        // Agregar los textos
        agregarTextosBotones();
        
        // Expandir el menú
        contenedorMenu.setAttribute('data-expandido', 'true');
        
        if (overlay) {
            overlay.classList.add('activo');
        }
        
        // Cambiar ícono del botón hamburguesa
        if (botonHamburguesa) {
            const svg = botonHamburguesa.querySelector('svg');
            if (svg && !botonHamburguesa._originalSvg) {
                botonHamburguesa._originalSvg = svg.innerHTML;
                svg.innerHTML = `
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                `;
            }
        }
    }
    
    function contraerMenu() {
        if (!contenedorMenu) return;
        
        menuExpandido = false;
        
        // Hacer desaparecer los textos
        const textos = document.querySelectorAll('.texto-ayuda-boton');
        textos.forEach(texto => {
            texto.style.animation = 'desaparecerTexto 0.15s ease-out forwards';
        });
        
        // Esperar a que desaparezcan los textos, luego contraer
        setTimeout(() => {
            contenedorMenu.setAttribute('data-expandido', 'false');
            
            if (overlay) {
                overlay.classList.remove('activo');
            }
            
            // Restaurar ícono
            if (botonHamburguesa && botonHamburguesa._originalSvg) {
                const svg = botonHamburguesa.querySelector('svg');
                if (svg) {
                    svg.innerHTML = botonHamburguesa._originalSvg;
                }
            }
            
            // Eliminar textos del DOM después de la transición
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