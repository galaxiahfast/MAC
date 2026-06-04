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
    console.log("DEBUG [Render]: Intentando renderizar. Datos actuales:", apartados);
    if (!contenedorLista || !template) {
        console.error("DEBUG [Error]: Elementos de UI no encontrados.");
        return;
    }
    contenedorLista.innerHTML = '';
    if (apartados.length === 0) {
        console.warn("DEBUG [Aviso]: No hay apartados en memoria.");
        contenedorLista.innerHTML = '<p style="text-align:center; padding:10px;">No hay apartados disponibles.</p>';
        return;
    }
    apartados.forEach(apartado => {
        const clon = template.content.cloneNode(true);
        clon.querySelector('.gestionar-apartado-nombre-texto').textContent = apartado.nombre;
        clon.querySelector('.btn-eliminar').addEventListener('click', () => {
            console.log("DEBUG [Acción]: Eliminando", apartado.nombre);
            eliminarApartado(apartado.nombre);
        });
        contenedorLista.appendChild(clon);
    });
    console.log("DEBUG [Render]: Lista renderizada con éxito.");
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
    }
}

/* @galaxiahfast - Función pública para cerrar el panel desde el controlador central */
export function cerrarPanelGestion() {
    const contenedor = document.getElementById('contenedorFlotanteGestionApartado');
    if (contenedor) contenedor.classList.add('estado-panel-oculto');
}

/* @galaxiahfast - Inicialización de suscripciones (reactividad) */
export function inicializarModuloGestion() {
    const contenedorFlotante = document.getElementById('contenedorFlotanteGestionApartado');
    suscribirse(() => {
        if (contenedorFlotante && !contenedorFlotante.classList.contains('estado-panel-oculto')) {
            renderizarListaApartados();
        }
    });
    if (contenedorFlotante) contenedorFlotante.addEventListener('click', (e) => e.stopPropagation());
    window.addEventListener('app:datos-listos', renderizarListaApartados);
}