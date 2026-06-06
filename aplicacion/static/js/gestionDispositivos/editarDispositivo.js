/* @galaxiahfast - Módulo encargado de gestionar la edición interactiva de detalles de dispositivos del mapa. */
import { DetallesAPI } from '../infraestructura/comunicacionHTTP.js';
import { sincronizarDispositivos } from '../infraestructura/sincronizarDispositivos.js';
import { mostrarNotificacion } from '../otros/sistemaNotificaciones.js';

/* ==========================================================================
   @galaxiahfast - ESTADO DEL MODO DE EDICIÓN
   ========================================================================== */

let modoEdicionActivo = false;
let dispositivoSeleccionado = null;



/* @galaxiahfast - Activa el modo de edición de dispositivos en el mapa. */
export function activarModoEdicion() {
    modoEdicionActivo = true;
    const mapa = document.getElementById('contenedorMapa');
    if (mapa) mapa.classList.add('modo-edicion-activo');
    mostrarNotificacion('Haz clic en un dispositivo para editar sus detalles', 'advertencia');
}



/* @galaxiahfast - Desactiva el modo de edición de dispositivos en el mapa. */
export function desactivarModoEdicion() {
    modoEdicionActivo = false;
    dispositivoSeleccionado = null;
    const mapa = document.getElementById('contenedorMapa');
    if (mapa) mapa.classList.remove('modo-edicion-activo');
}



/* @galaxiahfast - Retorna si el modo de edición está activo. */
export function esModoEdicionActivo() {
    return modoEdicionActivo;
}



/* @galaxiahfast - Cierra el panel de edición y limpia la selección. */
export function cerrarPanelEdicion() {
    const panel = document.getElementById('contenedorFlotanteEdicionDispositivo');
    if (panel) {
        panel.classList.add('estado-panel-oculto');
        panel.classList.remove('panel-formulario-activo');
    }
    dispositivoSeleccionado = null;
}



/* @galaxiahfast - Maneja el clic en un dispositivo del mapa para abrir el panel de edición. */
async function manejarClicDispositivo(event) {
    if (!modoEdicionActivo) return;

    const punto = event.target.closest('.dispositivo-punto');
    if (!punto) return;

    event.stopPropagation();

    const idDispositivo = parseInt(punto.dataset.id);
    if (!idDispositivo) return;

    dispositivoSeleccionado = idDispositivo;

    try {
        const res = await DetallesAPI.obtener(idDispositivo);
        if (res.estado !== 'exito') throw new Error(res.mensaje);

        renderizarPanelEdicion(idDispositivo, res.detalles);
    } catch (error) {
        mostrarNotificacion('No se pudieron cargar los detalles: ' + error.message, 'error');
    }
}



/* @galaxiahfast - Renderiza el panel de edición con los detalles del dispositivo seleccionado. */
function renderizarPanelEdicion(idDispositivo, detalles) {
    const panel = document.getElementById('contenedorFlotanteEdicionDispositivo');
    const titulo = document.getElementById('tituloEdicionDispositivo');
    const listaDetalles = document.getElementById('listaDetallesEdicion');

    if (!panel || !listaDetalles) return;

    titulo.textContent = `Editar Dispositivo #${idDispositivo}`;
    listaDetalles.innerHTML = '';

    if (!detalles || detalles.length === 0) {
        listaDetalles.innerHTML = '<p class="editar-dispositivo-sin-detalles">Este dispositivo no tiene apartados asignados.</p>';
    } else {
        detalles.forEach(detalle => {
            const fila = document.createElement('div');
            fila.className = 'editar-dispositivo-fila-detalle';

            fila.innerHTML = `
                <label class="editar-dispositivo-label-detalle">${detalle.nombreApartado}</label>
                <input type="text" class="editar-dispositivo-input-detalle" 
                       data-id-apartado="${detalle.idApartado}" 
                       value="${detalle.valor || ''}" 
                       placeholder="${detalle.valorPredeterminado || 'Sin valor'}">
                <button class="editar-dispositivo-btn-guardar" data-id-apartado="${detalle.idApartado}" title="Guardar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
            `;

            /* @galaxiahfast - Manejador de guardado de detalle individual. */
            fila.querySelector('.editar-dispositivo-btn-guardar').addEventListener('click', async () => {
                const input = fila.querySelector('.editar-dispositivo-input-detalle');
                const nuevoValor = input.value.trim();
                const idApartado = parseInt(input.dataset.idApartado);

                try {
                    const res = await DetallesAPI.actualizar(idDispositivo, idApartado, nuevoValor);
                    if (res.estado !== 'exito') throw new Error(res.mensaje);
                    mostrarNotificacion('Detalle actualizado correctamente', 'exito');
                    await sincronizarDispositivos();
                } catch (error) {
                    mostrarNotificacion('No se pudo guardar: ' + error.message, 'error');
                }
            });

            listaDetalles.appendChild(fila);
        });
    }

    panel.classList.remove('estado-panel-oculto');
    panel.classList.add('panel-formulario-activo');
}



/* @galaxiahfast - Muestra un tooltip con información del dispositivo al hacer hover. */
function manejarHoverDispositivo(event) {
    const punto = event.target.closest('.dispositivo-punto');
    
    /* @galaxiahfast - Remueve tooltips anteriores al mover el cursor. */
    document.querySelectorAll('.dispositivo-tooltip').forEach(t => t.remove());

    if (!punto || !modoEdicionActivo) return;

    const idDispositivo = punto.dataset.id;
    const tooltip = document.createElement('div');
    tooltip.className = 'dispositivo-tooltip';
    tooltip.textContent = `Dispositivo #${idDispositivo} — clic para editar`;
    punto.appendChild(tooltip);
}

/* @galaxiahfast - Remueve los tooltips cuando el cursor sale del punto. */
function manejarMouseOut(event) {
    const punto = event.target.closest('.dispositivo-punto');
    if (!punto) return;
    const tooltip = punto.querySelector('.dispositivo-tooltip');
    if (tooltip) tooltip.remove();
}



/* @galaxiahfast - Inicialización del módulo de edición de dispositivos. */
export function inicializarModuloEdicion() {
    const mapa = document.getElementById('contenedorMapa');
    if (mapa) {
        mapa.addEventListener('click', manejarClicDispositivo);
        mapa.addEventListener('mouseover', manejarHoverDispositivo);
        mapa.addEventListener('mouseout', manejarMouseOut);
    }
}
