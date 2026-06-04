/* @galaxiahfast - Módulo de gestión de apartados (renderizado y eliminación). */
import { getApartados, suscribirse } from '../infraestructura/memoriaCache.js';
import { eliminarApartado } from '../infraestructura/sincronizarApartados.js';

/* ==========================================================================
   @galaxiahfast - LÓGICA DE RENDERIZADO DE INTERFAZ
  ========================================================================== */

/* @galaxiahfast - Renderiza la lista de apartados desde la caché en el contenedor */
export function renderizarListaApartados() {
    const contenedorLista = document.getElementById('listaScrollGestionApartados');
    const template = document.getElementById('templateFilaApartado');
    const apartados = getApartados();
    
    if (!contenedorLista || !template) return;
    
    contenedorLista.innerHTML = '';
    if (apartados.length === 0) {
        contenedorLista.innerHTML = '<p style="text-align:center; padding:10px;">No hay apartados disponibles.</p>';
        return;
    }
    
    apartados.forEach(apartado => {
        const clon = template.content.cloneNode(true);
        clon.querySelector('.gestionar-apartado-nombre-texto').textContent = apartado.nombre;
        clon.querySelector('.btn-eliminar').addEventListener('click', () => {
            eliminarApartado(apartado.nombre);
        });
        contenedorLista.appendChild(clon);
    });
}

/* ==========================================================================
   @galaxiahfast - CONTROLADORES PARA EL MENÚ PRINCIPAL
   ========================================================================== */

/* @galaxiahfast - Función pública para abrir el panel desde el controlador central */
export function abrirPanelGestion() {
    const contenedor = document.getElementById('contenedorFlotanteGestionApartado');
    if (contenedor) {
        renderizarListaApartados();
        contenedor.classList.remove('estado-panel-oculto');
        // La clase 'panel-formulario-activo' es clave para que 'configurarClicFuera' 
        // detecte que este panel debe permanecer abierto.
        contenedor.classList.add('panel-formulario-activo'); 
    }
}

/* @galaxiahfast - Función pública para cerrar el panel desde el controlador central */
export function cerrarPanelGestion() {
    const contenedor = document.getElementById('contenedorFlotanteGestionApartado');
    if (contenedor) {
        contenedor.classList.add('estado-panel-oculto');
        contenedor.classList.remove('panel-formulario-activo');
    }
}

/* @galaxiahfast - Inicialización de suscripciones (reactividad) */
export function inicializarModuloGestion() {
    const contenedorFlotante = document.getElementById('contenedorFlotanteGestionApartado');
    suscribirse(() => {
        if (contenedorFlotante && !contenedorFlotante.classList.contains('estado-panel-oculto')) {
            renderizarListaApartados();
        }
    });
    window.addEventListener('app:datos-listos', renderizarListaApartados);
}