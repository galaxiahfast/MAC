/* @galaxiahfast - Módulo de gestión de apartados (renderizado, fecha, eliminación y scroll absoluto). */
import { getApartados, suscribirse } from '../infraestructura/memoriaCache.js';
import { eliminarApartado } from '../infraestructura/sincronizarApartados.js';

/* ==========================================================================
   @galaxiahfast - GESTIÓN DEL SCROLL ABSOLUTO
  ========================================================================== */

let scrollPos = 0; // Posición de control absoluto

function configurarScrollbarGestion() {
    const contenedor = document.getElementById('listaScrollGestionApartados');
    const contenido = document.getElementById('contenidoScrollableInterno');
    const thumb = document.getElementById('scrollbarThumbGestion');
    
    if (!contenedor || !contenido || !thumb) return;

    // Resetear posición al abrir
    scrollPos = 0;
    contenido.style.transform = `translateY(0px)`;

    const actualizar = () => {
        const { clientHeight } = contenedor;
        const scrollHeight = contenido.scrollHeight;
        
        const ratioVisible = clientHeight / scrollHeight;
        const thumbHeight = Math.max(ratioVisible * clientHeight, 40);
        const maxScroll = Math.max(0, scrollHeight - clientHeight);
        
        // Sincronizar Thumb
        const maxThumbTop = clientHeight - thumbHeight;
        const thumbTop = (scrollPos / maxScroll) * maxThumbTop;
        
        thumb.style.height = `${thumbHeight}px`;
        thumb.style.transform = `translateY(${thumbTop || 0}px)`;
        thumb.style.opacity = (scrollHeight <= clientHeight) ? '0' : '1';
    };

    // Control de Rueda (Wheel)
    // Control de Rueda (Wheel) - CORREGIDO
    contenedor.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        // 1. Definimos una velocidad fija, ignorando la aceleración del SO
        const factorVelocidad = 50; 
        const direccion = e.deltaY > 0 ? 1 : -1;
        
        const maxScroll = Math.max(0, contenido.scrollHeight - contenedor.clientHeight);
        
        // 2. Aplicamos un movimiento lineal fijo
        scrollPos = Math.max(0, Math.min(scrollPos + (direccion * factorVelocidad), maxScroll));
        
        contenido.style.transform = `translateY(-${scrollPos}px)`;
        actualizar();
    }, { passive: false });
    
    // Lógica de arrastre
    let thumbDragging = false;
    let dragStartY = 0;
    let initialScrollPos = 0;

    thumb.addEventListener('mousedown', (e) => {
        thumbDragging = true;
        dragStartY = e.clientY;
        initialScrollPos = scrollPos;
        thumb.classList.add('arrastrando');
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!thumbDragging) return;
        
        const deltaY = e.clientY - dragStartY;
        // Calculamos el ratio real de desplazamiento
        const scrollRatio = contenido.scrollHeight / contenedor.clientHeight;
        
        // Movemos la posición basándonos en el desplazamiento del ratón
        scrollPos = Math.max(0, Math.min(initialScrollPos + (deltaY * scrollRatio), contenido.scrollHeight - contenedor.clientHeight));
        
        contenido.style.transform = `translateY(-${scrollPos}px)`;
        actualizar();
    });

    document.addEventListener('mouseup', () => {
        if (thumbDragging) {
            thumbDragging = false;
            thumb.classList.remove('arrastrando');
            document.body.style.userSelect = '';
        }
    });

    actualizar();
}

export function desplazarApartados(direccion) {
    const contenedor = document.getElementById('listaScrollGestionApartados');
    const contenido = document.getElementById('contenidoScrollableInterno');
    if (!contenedor || !contenido) return;

    // Altura exacta de cada fila (altura 70 + margen 15)
    const paso = 85; 
    const maxScroll = Math.max(0, contenido.scrollHeight - contenedor.clientHeight);
    
    // Calculamos el nuevo scrollPos forzando que sea un múltiplo de 85
    let nuevoScroll = scrollPos + (direccion === 'down' ? paso : -paso);
    
    // Ajustar para que siempre sea múltiplo de 85 (evita los 90/95px)
    nuevoScroll = Math.round(nuevoScroll / paso) * paso;
    
    scrollPos = Math.max(0, Math.min(nuevoScroll, maxScroll));
    
    contenido.style.transform = `translateY(-${scrollPos}px)`;
    
    // Opcional: Actualizar el thumb si existe una función global para ello
    actualizar(); 
}

/* ==========================================================================
   @galaxiahfast - LÓGICA DE RENDERIZADO
  ========================================================================== */

function renderizarListaApartados() {
    const contenedorPadre = document.getElementById('listaScrollGestionApartados');
    const template = document.getElementById('templateFilaApartado');
    const apartados = getApartados();
    
    // Inyectar el contenedor interno si no existe
    let contenido = document.getElementById('contenidoScrollableInterno');
    if (!contenido) {
        contenido = document.createElement('div');
        contenido.id = 'contenidoScrollableInterno';
        contenedorPadre.appendChild(contenido);
    }
    
    contenido.innerHTML = '';
    
    if (!apartados || apartados.length === 0) {
        contenido.innerHTML = '<p style="text-align:center; padding:20px; color:var(--gestionar-apartado-color-subtitulos);">No hay apartados disponibles.</p>';
        return;
    }
    
    const iconos = ['<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>'];

    apartados.forEach(apartado => {
        const clon = template.content.cloneNode(true);
        clon.querySelector('.gestionar-apartado-icono-aleatorio').innerHTML = iconos[Math.floor(Math.random() * iconos.length)];
        clon.querySelector('.gestionar-apartado-nombre-texto').textContent = apartado.nombreApartado;
        
        const fechaEl = clon.querySelector('.gestionar-apartado-fecha-texto');
        if (fechaEl && apartado.fechaCreacion) {
            const fecha = new Date(apartado.fechaCreacion);
            const formato = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).formatToParts(fecha);
            const p = {}; formato.forEach(({type, value}) => { p[type] = value; });
            const mes = p.month.charAt(0).toUpperCase() + p.month.slice(1).replace('.', '');
            fechaEl.textContent = `${p.day}, ${mes}. ${p.year} ${p.hour}:${p.minute} ${p.dayPeriod.toUpperCase()}`;
        }
        
        clon.querySelector('.btn-eliminar').addEventListener('click', () => eliminarApartado(apartado.nombreApartado));
        contenido.appendChild(clon);
    });

    setTimeout(configurarScrollbarGestion, 0);
}

export function abrirPanelGestion() {
    const contenedor = document.getElementById('contenedorFlotanteGestionApartado');
    if (contenedor) {
        renderizarListaApartados();
        contenedor.classList.remove('estado-panel-oculto');
        contenedor.classList.add('panel-formulario-activo');
    }
}

export function cerrarPanelGestion() {
    const contenedor = document.getElementById('contenedorFlotanteGestionApartado');
    if (contenedor) {
        contenedor.classList.add('estado-panel-oculto');
        contenedor.classList.remove('panel-formulario-activo');
    }
}

export function inicializarModuloGestion() {
    suscribirse(() => {
        const contenedor = document.getElementById('contenedorFlotanteGestionApartado');
        if (contenedor && !contenedor.classList.contains('estado-panel-oculto')) {
            renderizarListaApartados();
        }
    });
    window.addEventListener('app:datos-listos', renderizarListaApartados);
}