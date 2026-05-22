function iniciarComportamientoMenuLateralPrincipal() {
    const contenedorBarraHerramientas = document.querySelector('.contenedor-barra-herramientas-principal');
    const contenedorInternoBarraHerramientas = document.querySelector('.contenedor-interno-barra-herramientas');
    const botonAlternarExpansionMenu = document.getElementById('botonAlternarExpansionMenuLateralPrincipal');

    if (!contenedorBarraHerramientas || !contenedorInternoBarraHerramientas || !botonAlternarExpansionMenu) {
        console.error('No se pudo inicializar el menú lateral principal.');
        return;
    }

    let menuLateralExpandido = false;

    const selectorBotonesMenu = `
        .boton-menu-herramienta-navegacion,
        .boton-menu-herramienta-dispositivo,
        .boton-menu-herramienta-apartado,
        .boton-menu-herramienta-papelera,
        .boton-menu-herramienta-tema,
        .boton-menu-herramienta-configuracion,
        .boton-menu-herramienta-sesion,
        .boton-menu-herramienta-usuario
    `;

    const textosBotonesExpandibles = {
        botonAlternarExpansionMenuLateralPrincipal: 'Menú',
        botonRegistrarNuevoDispositivoPlano: 'Nuevo dispositivo',
        botonActivarModoEliminacionDispositivos: 'Eliminar dispositivo',
        botonActivarModoEdicionDispositivos: 'Editar dispositivo',
        botonActivarModoReubicacionDispositivos: 'Mover dispositivo',
        botonAlternarVisibilidadDispositivosRenderizados: 'Visibilidad dispositivos',
        botonRegistrarNuevoApartadoGlobalDispositivos: 'Nuevo apartado',
        botonEliminarApartadosExistentesDispositivos: 'Eliminar apartado',
        botonAbrirPanelRestauracionElementosEliminados: 'Papelera',
        botonAlternarTemaVisualAplicacion: 'Tema visual',
        botonAbrirConfiguracionGeneralSistema: 'Configuración',
        botonCerrarSesionUsuarioActualSistema: 'Cerrar sesión',
        botonAbrirPerfilUsuarioAutenticadoSistema: 'Perfil usuario'
    };

    const titulosSeparadoresMenu = {
        'gestion-dispositivos': 'DISPOSITIVOS',
        'preferencias-visuales': 'APARIENCIA',
        'configuracion-general': 'SISTEMA',
        'perfil-usuario': 'USUARIO'
    };

    function calcularAnchoAutomaticoMenuExpandido() {
        const botonesMenu = contenedorInternoBarraHerramientas.querySelectorAll(selectorBotonesMenu);
        let anchoMaximo = 0;

        botonesMenu.forEach(boton => {
            const texto = textosBotonesExpandibles[boton.id];
            if (!texto) return;

            const temp = document.createElement('span');
            temp.style.position = 'absolute';
            temp.style.visibility = 'hidden';
            temp.style.whiteSpace = 'nowrap';
            temp.style.fontSize = '14px';
            temp.style.fontWeight = '450';
            temp.textContent = texto;

            document.body.appendChild(temp);

            const ancho = temp.offsetWidth;
            document.body.removeChild(temp);

            const total = 54 + 16 + ancho + 36;

            if (total > anchoMaximo) {
                anchoMaximo = total;
            }
        });

        return Math.min(Math.max(anchoMaximo, 240), 340);
    }

    function agregarTextoExpandidoBoton(boton, texto) {
        if (!boton || !texto) return;
        if (boton.querySelector('.texto-expandido-boton-menu')) return;

        const span = document.createElement('span');
        span.className = 'texto-expandido-boton-menu';
        span.textContent = texto;

        boton.appendChild(span);
    }

    function agregarTituloSeparadorMenu(separador, titulo) {
        if (!separador || !titulo) return;
        if (separador.querySelector('.contenedor-titulo-separador-menu')) return;

        const contenedor = document.createElement('div');
        contenedor.className = 'contenedor-titulo-separador-menu';

        const texto = document.createElement('span');
        texto.className = 'texto-separador-menu';
        texto.textContent = titulo;

        const linea = document.createElement('div');
        linea.className = 'linea-separador-menu';

        contenedor.appendChild(texto);
        contenedor.appendChild(linea);
        separador.appendChild(contenedor);
    }

    function expandir() {
        const ancho = calcularAnchoAutomaticoMenuExpandido();

        contenedorBarraHerramientas.classList.add('menu-lateral-expandido');
        contenedorBarraHerramientas.style.setProperty('--ancho-expandido-menu-lateral', `${ancho}px`);

        contenedorInternoBarraHerramientas
            .querySelectorAll(selectorBotonesMenu)
            .forEach(b => agregarTextoExpandidoBoton(b, textosBotonesExpandibles[b.id]));

        contenedorInternoBarraHerramientas
            .querySelectorAll('.contenedor-separador-seccion-menu-lateral')
            .forEach(s => agregarTituloSeparadorMenu(s, titulosSeparadoresMenu[s.dataset.seccionMenu]));

        menuLateralExpandido = true;
    }

    function colapsar() {
        contenedorBarraHerramientas.classList.remove('menu-lateral-expandido');
        contenedorBarraHerramientas.style.removeProperty('--ancho-expandido-menu-lateral');

        document.querySelectorAll('.texto-expandido-boton-menu')
            .forEach(e => e.remove());

        // FIX: NO destruir separadores, CSS controla visibilidad
        document.querySelectorAll('.contenedor-titulo-separador-menu')
            .forEach(e => e.remove());

        menuLateralExpandido = false;
    }

    botonAlternarExpansionMenu.addEventListener('click', e => {
        e.stopPropagation();
        menuLateralExpandido ? colapsar() : expandir();
    });
}

document.addEventListener('DOMContentLoaded', iniciarComportamientoMenuLateralPrincipal);