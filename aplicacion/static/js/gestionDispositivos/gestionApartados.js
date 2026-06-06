/* @galaxiahfast - Módulo de gestión de apartados (renderizado, fecha, eliminación, edición, copia y scroll absoluto). */
import { getApartados, suscribirse } from '../infraestructura/memoriaCache.js';
import { eliminarApartado, editarApartadoGlobal } from '../infraestructura/sincronizarApartados.js';
import { mostrarNotificacion } from '../otros/sistemaNotificaciones.js';

/* ==========================================================================
   @galaxiahfast - GESTIÓN DEL SCROLL ABSOLUTO
  ========================================================================== */

let scrollPos = 0;
let actualizarScrollFn = null;

function configurarScrollbarGestion() {
    const contenedor = document.getElementById('listaScrollGestionApartados');
    const contenido = document.getElementById('contenidoScrollableInterno');
    const thumb = document.getElementById('scrollbarThumbGestion');
    
    if (!contenedor || !contenido || !thumb) return;

    scrollPos = 0;
    contenido.style.transform = `translateY(0px)`;

    const actualizar = () => {
        const { clientHeight } = contenedor;
        const scrollHeight = contenido.scrollHeight;
        
        const ratioVisible = clientHeight / scrollHeight;
        const thumbHeight = Math.max(ratioVisible * clientHeight, 40);
        const maxScroll = Math.max(0, scrollHeight - clientHeight);
        
        const maxThumbTop = clientHeight - thumbHeight;
        const thumbTop = (scrollPos / maxScroll) * maxThumbTop;
        
        thumb.style.height = `${thumbHeight}px`;
        thumb.style.transform = `translateY(${thumbTop || 0}px)`;
        thumb.style.opacity = (scrollHeight <= clientHeight) ? '0' : '1';
    };

    /* @galaxiahfast - Expone la función actualizar para uso externo. */
    actualizarScrollFn = actualizar;

    contenedor.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const factorVelocidad = 50; 
        const direccion = e.deltaY > 0 ? 1 : -1;
        
        const maxScroll = Math.max(0, contenido.scrollHeight - contenedor.clientHeight);
        
        scrollPos = Math.max(0, Math.min(scrollPos + (direccion * factorVelocidad), maxScroll));
        
        contenido.style.transform = `translateY(-${scrollPos}px)`;
        actualizar();
    }, { passive: false });
    
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
        const scrollRatio = contenido.scrollHeight / contenedor.clientHeight;
        
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

/* @galaxiahfast - Desplaza la lista de apartados en la dirección indicada. */
export function desplazarApartados(direccion) {
    const contenedor = document.getElementById('listaScrollGestionApartados');
    const contenido = document.getElementById('contenidoScrollableInterno');
    if (!contenedor || !contenido) return;

    const paso = 85; 
    const maxScroll = Math.max(0, contenido.scrollHeight - contenedor.clientHeight);
    
    let nuevoScroll = scrollPos + (direccion === 'down' ? paso : -paso);
    
    nuevoScroll = Math.round(nuevoScroll / paso) * paso;
    
    scrollPos = Math.max(0, Math.min(nuevoScroll, maxScroll));
    
    contenido.style.transform = `translateY(-${scrollPos}px)`;
    
    /* @galaxiahfast - Actualiza el thumb si la función está disponible. */
    if (actualizarScrollFn) actualizarScrollFn();
}

/* ==========================================================================
   @galaxiahfast - LÓGICA DE RENDERIZADO
  ========================================================================== */

function renderizarListaApartados() {
    const contenedorPadre = document.getElementById('listaScrollGestionApartados');
    const template = document.getElementById('templateFilaApartado');
    const apartados = getApartados();
    
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
        
        /* @galaxiahfast - Botón copiar: copia el nombre del apartado al portapapeles. */
        clon.querySelector('.btn-copiar').addEventListener('click', () => {
            navigator.clipboard.writeText(apartado.nombreApartado).then(() => {
                mostrarNotificacion('Nombre copiado al portapapeles', 'exito');
            }).catch(() => {
                mostrarNotificacion('No se pudo copiar', 'error');
            });
        });

        /* @galaxiahfast - Botón editar: transforma la fila en campos editables inline. */
        const filaElement = clon.querySelector('.gestionar-apartado-item-fila');
        clon.querySelector('.btn-editar').addEventListener('click', () => {
            activarEdicionInline(filaElement, apartado);
        });

        /* @galaxiahfast - Botón eliminar: solicita confirmación antes de ejecutar la eliminación. */
        clon.querySelector('.btn-eliminar').addEventListener('click', () => {
            if (confirm(`¿Eliminar el apartado "${apartado.nombreApartado}"? Se moverá a la papelera.`)) {
                eliminarApartado(apartado.nombreApartado);
            }
        });

        contenido.appendChild(clon);
    });

    setTimeout(configurarScrollbarGestion, 0);
}

/* @galaxiahfast - Transforma una fila de apartado en modo edición inline con campos de nombre y valor. */
function activarEdicionInline(filaElement, apartado) {
    const infoBloque = filaElement.querySelector('.gestionar-apartado-info-bloque');
    const grupoBotones = filaElement.querySelector('.gestionar-apartado-grupo-botones');
    if (!infoBloque || !grupoBotones) return;

    /* @galaxiahfast - Guarda el HTML original para restaurar si se cancela. */
    const htmlOriginalInfo = infoBloque.innerHTML;
    const htmlOriginalBotones = grupoBotones.innerHTML;

    /* @galaxiahfast - Reemplaza el contenido con campos de edición. */
    infoBloque.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:6px; width:100%;">
            <input type="text" class="editar-inline-nombre" value="${apartado.nombreApartado}" 
                   style="background:var(--gestionar-apartado-fondo-item); color:var(--gestionar-apartado-color-nombre); border:1px solid var(--gestionar-apartado-color-borde); border-radius:6px; padding:4px 8px; font-size:12px; outline:none;">
            <input type="text" class="editar-inline-valor" value="${apartado.valorPredeterminado || ''}" placeholder="Valor predeterminado"
                   style="background:var(--gestionar-apartado-fondo-item); color:var(--gestionar-apartado-color-subtitulos); border:1px solid var(--gestionar-apartado-color-borde); border-radius:6px; padding:4px 8px; font-size:11px; outline:none;">
        </div>
    `;

    /* @galaxiahfast - Reemplaza botones con guardar/cancelar. */
    grupoBotones.innerHTML = `
        <button class="gestionar-apartado-btn-accion btn-guardar-edicion" title="Guardar" style="color: var(--gestionar-apartado-color-nombre);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </button>
        <button class="gestionar-apartado-btn-accion btn-cancelar-edicion" title="Cancelar" style="color: var(--gestionar-apartado-color-subtitulos);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;

    /* @galaxiahfast - Manejador de guardar edición. */
    grupoBotones.querySelector('.btn-guardar-edicion').addEventListener('click', async () => {
        const nuevoNombre = infoBloque.querySelector('.editar-inline-nombre').value.trim();
        const nuevoValor = infoBloque.querySelector('.editar-inline-valor').value.trim();

        if (!nuevoNombre) {
            mostrarNotificacion('El nombre no puede estar vacío', 'advertencia');
            return;
        }

        await editarApartadoGlobal(apartado.id, nuevoNombre, nuevoValor);
    });

    /* @galaxiahfast - Manejador de cancelar edición. */
    grupoBotones.querySelector('.btn-cancelar-edicion').addEventListener('click', () => {
        infoBloque.innerHTML = htmlOriginalInfo;
        grupoBotones.innerHTML = htmlOriginalBotones;
        /* @galaxiahfast - Re-renderiza para restaurar los event listeners. */
        renderizarListaApartados();
    });
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
