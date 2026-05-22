/* @galaxiahfast - Comportamiento del menú lateral. */

/* @galaxiahfast - Inicializa todos los eventos del menú. */
function iniciarComportamientoMenu() {

    /* @galaxiahfast - Obtener todos los botones del menú. */
    const botonMenu = document.getElementById('controlMenuHamburguesa');
    const menuBarra = document.querySelector('.barra-herramientas-lateral');
    
    /* @galaxiahfast - Estado del menú expandido. */
    let menuExpandido = false;

    /* @galaxiahfast - Función para calcular el ancho automático basado en el texto más largo. */
    function calcularAnchoAutomatico() {
        const botonesConTexto = menuBarra.querySelectorAll('.boton-control-menu, .boton-control-tema, .boton-control-punto, .boton-control-apartado, .boton-control-papelera, .boton-control-configuracion, .boton-control-salida, .boton-control-usuario');
        let anchoMaximo = 0;
        
        botonesConTexto.forEach(boton => {
            const texto = boton.querySelector('.texto-boton');
            if (texto) {
                /* @galaxiahfast - Medir el ancho del texto temporalmente. */
                const spanMedicion = document.createElement('span');
                spanMedicion.style.cssText = 'position: absolute; visibility: hidden; font-size: 14px; font-weight: 450; white-space: nowrap;';
                spanMedicion.textContent = texto.textContent;
                document.body.appendChild(spanMedicion);
                const anchoTexto = spanMedicion.offsetWidth;
                document.body.removeChild(spanMedicion);
                
                /* @galaxiahfast - Ancho total = icono (54px) + gap (14px) + texto + padding (28px) */
                const anchoTotal = 54 + 14 + anchoTexto + 28;
                if (anchoTotal > anchoMaximo) anchoMaximo = anchoTotal;
            }
        });
        
        /* @galaxiahfast - Ancho mínimo de 260px, máximo de 320px */
        return Math.min(Math.max(anchoMaximo, 260), 320);
    }

    /* @galaxiahfast - Función para crear el menú expandido. */
    function expandirMenu() {
        if (!menuBarra) return;
        
        /* @galaxiahfast - Calcular ancho automático. */
        const anchoAutomatico = calcularAnchoAutomatico();
        
        menuBarra.classList.add('menu-expandido');
        menuBarra.style.width = anchoAutomatico + 'px';
        menuBarra.style.alignItems = 'flex-start';
        /* @galaxiahfast - Padding: arriba/abajo 24px, izquierdo 16px, derecho 16px + espacio scroll */
        menuBarra.style.padding = '24px 22px 24px 16px';
        
        /* @galaxiahfast - Modificar el botón menú hamburguesa para incluir texto. */
        const botonMenuElement = document.getElementById('controlMenuHamburguesa');
        if (botonMenuElement && !botonMenuElement.querySelector('.texto-boton')) {
            const textoMenu = document.createElement('span');
            textoMenu.className = 'texto-boton';
            textoMenu.textContent = 'Menú';
            botonMenuElement.appendChild(textoMenu);
        }
        
        /* @galaxiahfast - Agregar texto a todos los demás botones. */
        const botones = menuBarra.querySelectorAll('.boton-control-punto, .boton-control-apartado, .boton-control-papelera, .boton-control-tema, .boton-control-configuracion, .boton-control-salida, .boton-control-usuario');
        
        /* @galaxiahfast - Textos formales sin palabras repetitivas. */
        const textosBotones = {
            'accionAgregarDispositivo': 'Nuevo',
            'accionEliminarDispositivo': 'Eliminar',
            'accionEditarDispositivo': 'Editar',
            'accionMoverDispositivo': 'Mover',
            'accionOcultarDispositivo': 'Ocultar',
            'accionAgregarCampoDispositivo': 'Nueva',
            'accionEliminarCampoDispositivo': 'Eliminar',
            'accionRestaurarDispositivoCampo': 'Papelera',
            'controlAlternarTema': 'Tema',
            'controlConfiguracion': 'Ajustes',
            'controlSalida': 'Salir',
            'controlPerfilUsuario': 'Perfil'
        };
        
        botones.forEach(boton => {
            const texto = textosBotones[boton.id];
            if (texto && !boton.querySelector('.texto-boton')) {
                const span = document.createElement('span');
                span.className = 'texto-boton';
                span.textContent = texto;
                boton.appendChild(span);
            }
        });
        
        /* @galaxiahfast - Agregar títulos a los separadores (debajo de la línea). */
        const separadores = menuBarra.querySelectorAll('.divisor-seccion-menu, .divisor-seccion-final, .divisor-seccion-config');
        
        const titulosSeparadores = {
            'divisor-seccion-menu': 'EQUIPOS',
            'divisor-seccion-final': 'PROPIEDADES',
            'divisor-seccion-config': 'SISTEMA'
        };
        
        separadores.forEach(separador => {
            const clase = separador.className;
            const titulo = titulosSeparadores[clase];
            if (titulo && !separador.querySelector('.titulo-separador')) {
                const tituloSpan = document.createElement('span');
                tituloSpan.className = 'titulo-separador';
                tituloSpan.textContent = titulo;
                separador.appendChild(tituloSpan);
            }
        });
        
        menuExpandido = true;
    }
    
    /* @galaxiahfast - Función para colapsar el menú original. */
    function colapsarMenu() {
        if (!menuBarra) return;
        
        menuBarra.classList.remove('menu-expandido');
        menuBarra.style.width = '';
        menuBarra.style.alignItems = '';
        menuBarra.style.padding = '';
        
        /* @galaxiahfast - Restaurar botón menú hamburguesa original. */
        const botonMenuElement = document.getElementById('controlMenuHamburguesa');
        if (botonMenuElement) {
            const textoExtra = botonMenuElement.querySelector('.texto-boton');
            if (textoExtra) textoExtra.remove();
        }
        
        /* @galaxiahfast - Eliminar textos de los botones. */
        const textos = menuBarra.querySelectorAll('.texto-boton');
        textos.forEach(texto => texto.remove());
        
        /* @galaxiahfast - Eliminar títulos de los separadores. */
        const titulos = menuBarra.querySelectorAll('.titulo-separador');
        titulos.forEach(titulo => titulo.remove());
        
        menuExpandido = false;
    }
    
    /* @galaxiahfast - Alternar menú hamburguesa. */
    if (botonMenu) {
        botonMenu.addEventListener('click', (evento) => {
            evento.stopPropagation();
            
            if (menuExpandido) {
                colapsarMenu();
            } else {
                expandirMenu();
            }
        });
    }
    
    /* @galaxiahfast - Obtener todos los botones de acción. */
    const botonAgregarEquipo = document.getElementById('accionAgregarDispositivo');
    const botonEliminarEquipo = document.getElementById('accionEliminarDispositivo');
    const botonEditarEquipo = document.getElementById('accionEditarDispositivo');
    const botonMoverEquipo = document.getElementById('accionMoverDispositivo');
    const botonOcultarEquipo = document.getElementById('accionOcultarDispositivo');
    const botonAgregarPropiedad = document.getElementById('accionAgregarCampoDispositivo');
    const botonEliminarPropiedad = document.getElementById('accionEliminarCampoDispositivo');
    const botonPapelera = document.getElementById('accionRestaurarDispositivoCampo');
    const botonConfiguracion = document.getElementById('controlConfiguracion');
    const botonSalida = document.getElementById('controlSalida');
    const botonPerfil = document.getElementById('controlPerfilUsuario');

    /* @galaxiahfast - Estado de modos activos. */
    let modoEliminarActivo = false;
    let modoEditarActivo = false;
    let modoMoverActivo = false;
    let modoOcultarActivo = false;

    /* @galaxiahfast - Función para resetear todos los modos. */
    function resetearModos() {
        modoEliminarActivo = false;
        modoEditarActivo = false;
        modoMoverActivo = false;
        modoOcultarActivo = false;
        
        if (botonEliminarEquipo) botonEliminarEquipo.classList.remove('modo-eliminar');
        if (botonEditarEquipo) botonEditarEquipo.classList.remove('modo-editar');
        if (botonMoverEquipo) botonMoverEquipo.classList.remove('modo-mover');
        if (botonOcultarEquipo) botonOcultarEquipo.classList.remove('modo-ocultar');
        
        /* @galaxiahfast - Ocultar todos los botones de acción en los puntos. */
        document.querySelectorAll('.equipo-boton-eliminar, .equipo-boton-editar, .equipo-boton-mover, .equipo-boton-ocultar').forEach(boton => {
            boton.style.display = 'none';
        });
    }

    /* @galaxiahfast - Botón agregar equipo. */
    if (botonAgregarEquipo) {
        botonAgregarEquipo.addEventListener('click', () => {
            resetearModos();
            console.log('@galaxiahfast - Abrir formulario para agregar nuevo equipo');
        });
    }

    /* @galaxiahfast - Botón eliminar equipo. */
    if (botonEliminarEquipo) {
        botonEliminarEquipo.addEventListener('click', () => {
            resetearModos();
            modoEliminarActivo = true;
            botonEliminarEquipo.classList.add('modo-eliminar');
            console.log('@galaxiahfast - Modo eliminar activado');
            
            document.querySelectorAll('.equipo').forEach(equipo => {
                const botonEliminar = equipo.querySelector('.equipo-boton-eliminar');
                if (botonEliminar) botonEliminar.style.display = 'flex';
            });
        });
    }

    /* @galaxiahfast - Botón editar equipo. */
    if (botonEditarEquipo) {
        botonEditarEquipo.addEventListener('click', () => {
            resetearModos();
            modoEditarActivo = true;
            botonEditarEquipo.classList.add('modo-editar');
            console.log('@galaxiahfast - Modo editar activado');
        });
    }

    /* @galaxiahfast - Botón mover equipo. */
    if (botonMoverEquipo) {
        botonMoverEquipo.addEventListener('click', () => {
            resetearModos();
            modoMoverActivo = true;
            botonMoverEquipo.classList.add('modo-mover');
            console.log('@galaxiahfast - Modo mover activado');
        });
    }

    /* @galaxiahfast - Botón ocultar equipo. */
    if (botonOcultarEquipo) {
        botonOcultarEquipo.addEventListener('click', () => {
            resetearModos();
            modoOcultarActivo = true;
            botonOcultarEquipo.classList.add('modo-ocultar');
            console.log('@galaxiahfast - Modo ocultar activado');
        });
    }

    /* @galaxiahfast - Botón agregar propiedad. */
    if (botonAgregarPropiedad) {
        botonAgregarPropiedad.addEventListener('click', () => {
            resetearModos();
            console.log('@galaxiahfast - Abrir formulario para agregar nueva propiedad');
        });
    }

    /* @galaxiahfast - Botón eliminar propiedad. */
    if (botonEliminarPropiedad) {
        botonEliminarPropiedad.addEventListener('click', () => {
            resetearModos();
            console.log('@galaxiahfast - Modo eliminar propiedad activado');
        });
    }

    /* @galaxiahfast - Botón papelera. */
    if (botonPapelera) {
        botonPapelera.addEventListener('click', () => {
            resetearModos();
            console.log('@galaxiahfast - Abrir papelera');
        });
    }

    /* @galaxiahfast - Botón configuración. */
    if (botonConfiguracion) {
        botonConfiguracion.addEventListener('click', () => {
            resetearModos();
            console.log('@galaxiahfast - Abrir panel de ajustes');
        });
    }

    /* @galaxiahfast - Botón salir. */
    if (botonSalida) {
        botonSalida.addEventListener('click', () => {
            resetearModos();
            console.log('@galaxiahfast - Cerrar sesión');
            if (confirm('¿Estás seguro de que deseas salir?')) {
                window.location.href = '/logout';
            }
        });
    }

    /* @galaxiahfast - Botón perfil. */
    if (botonPerfil) {
        botonPerfil.addEventListener('click', () => {
            resetearModos();
            console.log('@galaxiahfast - Abrir mi cuenta');
        });
    }
}

/* @galaxiahfast - Inicializar comportamiento del menú al cargar el documento. */
document.addEventListener(
    'DOMContentLoaded',
    iniciarComportamientoMenu
);