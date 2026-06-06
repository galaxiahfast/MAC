/* @galaxiahfast - Módulo de gestión de apartados (renderizado, fecha, eliminación y scroll personalizado). */
import { getApartados, suscribirse } from '../infraestructura/memoriaCache.js';
import { eliminarApartado } from '../infraestructura/sincronizarApartados.js';
import { inicializarScrollbar } from '../infraestructura/scrollbarPersonalizado.js';

/* ==========================================================================
   @galaxiahfast - GESTIÓN DEL SCROLL PERSONALIZADO
  ========================================================================== */

function configurarScrollbarGestion() {
    const contenedor = document.getElementById('listaScrollGestionApartados');
    const thumb = document.getElementById('scrollbarThumbGestion');
    inicializarScrollbar(contenedor, thumb, { alturaMinima: 40 });
}

/* @galaxiahfast - Nueva función para scroll por pasos */
export function desplazarApartados(direccion) {
    const contenedor = document.getElementById('listaScrollGestionApartados');
    if (!contenedor) return;

    // Obtenemos la primera fila para saber cuánto medir
    const primeraFila = contenedor.querySelector('.gestionar-apartado-item-fila');
    if (!primeraFila) return;

    // Calculamos alto total (altura + margen)
    const estilo = window.getComputedStyle(primeraFila);
    const alturaFila = primeraFila.offsetHeight + parseInt(estilo.marginBottom);
    
    // Si dirección es 'down' sumamos, si es 'up' restamos
    const cantidad = direccion === 'down' ? alturaFila : -alturaFila;

    contenedor.scrollBy({
        top: cantidad,
        behavior: 'smooth'
    });
}

/* ==========================================================================
   @galaxiahfast - LÓGICA DE RENDERIZADO DE INTERFAZ
  ========================================================================== */

function renderizarListaApartados() {
    const contenedorLista = document.getElementById('listaScrollGestionApartados');
    const template = document.getElementById('templateFilaApartado');
    const apartados = getApartados();
    
    if (!contenedorLista || !template) return;
    
    const iconos = [
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>'
    ];
    
    contenedorLista.innerHTML = '';
    
    if (!apartados || apartados.length === 0) {
        contenedorLista.innerHTML = '<p style="text-align:center; padding:20px; color:var(--gestionar-apartado-color-subtitulos);">No hay apartados disponibles.</p>';
        return;
    }
    
    apartados.forEach(apartado => {
        const clon = template.content.cloneNode(true);
        
        clon.querySelector('.gestionar-apartado-icono-aleatorio').innerHTML = iconos[Math.floor(Math.random() * iconos.length)];
        clon.querySelector('.gestionar-apartado-nombre-texto').textContent = apartado.nombreApartado;
        
        const fechaEl = clon.querySelector('.gestionar-apartado-fecha-texto');
        if (fechaEl && apartado.fechaCreacion) {
            const fecha = new Date(apartado.fechaCreacion);
            const formato = new Intl.DateTimeFormat('es-ES', { 
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true 
            }).formatToParts(fecha);
            
            const p = {};
            formato.forEach(({type, value}) => { p[type] = value; });
            
            const mes = p.month.charAt(0).toUpperCase() + p.month.slice(1).replace('.', '');
            fechaEl.textContent = `${p.day}, ${mes}. ${p.year} ${p.hour}:${p.minute} ${p.dayPeriod.toUpperCase()}`;
        }
        
        clon.querySelector('.btn-eliminar').addEventListener('click', () => eliminarApartado(apartado.nombreApartado));
        contenedorLista.appendChild(clon);
    });

    setTimeout(configurarScrollbarGestion, 0);
}

/* ==========================================================================
   @galaxiahfast - CONTROLADORES Y EXPORTACIONES
  ========================================================================== */

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