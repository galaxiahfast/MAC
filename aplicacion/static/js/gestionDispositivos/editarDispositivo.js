/* @galaxiahfast - Módulo encargado de gestionar la lógica de edición de detalles de un dispositivo seleccionado. */
import { DetallesAPI } from '../infraestructura/comunicacionHTTP.js';
import { sincronizarDispositivos } from '../infraestructura/sincronizarDispositivos.js';

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
}



/* @galaxiahfast - Desactiva el modo de edición de dispositivos en el mapa. */
export function desactivarModoEdicion() {
    modoEdicionActivo = false;
    dispositivoSeleccionado = null;
    const mapa = document.getElementById('contenedorMapa');
    if (mapa) mapa.classList.remove('modo-edicion-activo');
    cerrarPanelEdicion();
}



/* @galaxiahfast - Retorna si el modo de edición está activo. */
export function esModoEdicionActivo() {
    return modoEdicionActivo;
}



/* @galaxiahfast - Abre el panel flotante de edición de detalles del dispositivo. */
export function abrirPanelEdicion() {
    const contenedor = document.getElementById('contenedorFlotanteEdicionDispositivo');
    if (contenedor) {
        contenedor.classList.remove('estado-panel-oculto');
        contenedor.classList.add('panel-formulario-activo');
    }
}



/* @galaxiahfast - Cierra el panel flotante de edición de detalles del dispositivo. */
export function cerrarPanelEdicion() {
    const contenedor = document.getElementById('contenedorFlotanteEdicionDispositivo');
    if (contenedor) {
        contenedor.classList.add('estado-panel-oculto');
        contenedor.classList.remove('panel-formulario-activo');
    }
}



/* @galaxiahfast - Carga y renderiza los detalles del dispositivo seleccionado en el panel de edición. */
async function cargarDetallesDispositivo(idDispositivo) {
    dispositivoSeleccionado = idDispositivo;

    const contenedorLista = document.getElementById('listaDetallesEdicion');
    if (!contenedorLista) return;

    // @galaxiahfast - Muestra estado de carga.
    contenedorLista.innerHTML = '<p style="text-align:center; padding:20px; color:var(--editar-dispositivo-color-subtitulos);">Cargando...</p>';

    try {
        const res = await DetallesAPI.obtener(idDispositivo);
        if (res.estado !== 'exito') throw new Error(res.mensaje);

        contenedorLista.innerHTML = '';

        if (!res.detalles || res.detalles.length === 0) {
            contenedorLista.innerHTML = '<p style="text-align:center; padding:20px; color:var(--editar-dispositivo-color-subtitulos);">Sin apartados configurados.</p>';
            return;
        }

        // @galaxiahfast - Renderiza cada detalle como un campo editable.
        res.detalles.forEach(detalle => {
            const fila = document.createElement('div');
            fila.className = 'editar-dispositivo-item-detalle';
            fila.innerHTML = `
                <label class="editar-dispositivo-label-detalle">${detalle.nombreApartado}</label>
                <div class="editar-dispositivo-grupo-input">
                    <input type="text" class="editar-dispositivo-input-detalle" 
                           data-id-apartado="${detalle.idApartado}" 
                           value="${detalle.valorDetalle || ''}" 
                           placeholder="Sin valor">
                    <button class="editar-dispositivo-btn-guardar" data-id-apartado="${detalle.idApartado}" title="Guardar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                </div>
            `;
            contenedorLista.appendChild(fila);
        });

    } catch (error) {
        contenedorLista.innerHTML = `<p style="text-align:center; padding:20px; color:var(--editar-dispositivo-color-subtitulos);">Error: ${error.message}</p>`;
    }
}



/* @galaxiahfast - Maneja el clic en un punto de dispositivo para abrir su panel de edición. */
function manejarClicDispositivo(event) {
    if (!modoEdicionActivo) return;

    // @galaxiahfast - Busca el elemento del dispositivo más cercano al clic.
    const punto = event.target.closest('.punto-dispositivo');
    if (!punto) return;

    event.stopPropagation();

    // @galaxiahfast - Obtiene el identificador del dispositivo desde el atributo data.
    const idDispositivo = parseInt(punto.dataset.idDispositivo);
    if (!idDispositivo) return;

    // @galaxiahfast - Actualiza el título del panel con el ID del dispositivo.
    const titulo = document.getElementById('tituloEdicionDispositivo');
    if (titulo) titulo.textContent = `Dispositivo #${idDispositivo}`;

    // @galaxiahfast - Carga los detalles y abre el panel.
    cargarDetallesDispositivo(idDispositivo);
    abrirPanelEdicion();
}



/* @galaxiahfast - Maneja el guardado de un detalle individual al hacer clic en el botón guardar. */
async function manejarGuardarDetalle(event) {
    const boton = event.target.closest('.editar-dispositivo-btn-guardar');
    if (!boton || !dispositivoSeleccionado) return;

    const idApartado = parseInt(boton.dataset.idApartado);
    const input = boton.parentElement.querySelector('.editar-dispositivo-input-detalle');
    if (!input) return;

    const valor = input.value.trim();

    try {
        const res = await DetallesAPI.actualizar(dispositivoSeleccionado, idApartado, valor);
        if (res.estado !== 'exito') throw new Error(res.mensaje);

        // @galaxiahfast - Feedback visual de éxito.
        boton.style.color = 'var(--editar-dispositivo-color-exito)';
        setTimeout(() => { boton.style.color = ''; }, 1000);

        // @galaxiahfast - Resincroniza los dispositivos para reflejar el cambio.
        await sincronizarDispositivos();

    } catch (error) {
        alert('Error al guardar: ' + error.message);
    }
}



/* @galaxiahfast - Inicialización del módulo de edición de dispositivos. */
export function inicializarModuloEdicion() {
    const capaDispositivos = document.getElementById('capaDispositivos');
    if (capaDispositivos) {
        capaDispositivos.addEventListener('click', manejarClicDispositivo);
    }

    // @galaxiahfast - Delegación de eventos para los botones de guardar dentro del panel.
    const panelEdicion = document.getElementById('contenedorFlotanteEdicionDispositivo');
    if (panelEdicion) {
        panelEdicion.addEventListener('click', manejarGuardarDetalle);
    }
}
