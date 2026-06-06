/* @galaxiahfast - Módulo encargado de gestionar la papelera de elementos eliminados (dispositivos y apartados). */
import { PapeleraAPI, DispositivosAPI, ApartadosAPI } from '../infraestructura/comunicacionHTTP.js';
import { sincronizarDispositivos } from '../infraestructura/sincronizarDispositivos.js';
import { sincronizarApartados } from '../infraestructura/sincronizarApartados.js';

/* ==========================================================================
   @galaxiahfast - LÓGICA DE RENDERIZADO DE LA PAPELERA
   ========================================================================== */



/* @galaxiahfast - Carga y renderiza los elementos eliminados en el panel de la papelera. */
async function cargarElementosPapelera() {
    const contenedorDispositivos = document.getElementById('listaPapeleraDispositivos');
    const contenedorApartados = document.getElementById('listaPapeleraApartados');

    if (!contenedorDispositivos || !contenedorApartados) return;

    // @galaxiahfast - Muestra estado de carga.
    contenedorDispositivos.innerHTML = '<p class="papelera-mensaje-vacio">Cargando...</p>';
    contenedorApartados.innerHTML = '<p class="papelera-mensaje-vacio">Cargando...</p>';

    try {
        const res = await PapeleraAPI.listar();
        if (res.estado !== 'exito') throw new Error(res.mensaje);

        // @galaxiahfast - Renderiza dispositivos eliminados.
        renderizarDispositivosEliminados(contenedorDispositivos, res.dispositivos || []);

        // @galaxiahfast - Renderiza apartados eliminados.
        renderizarApartadosEliminados(contenedorApartados, res.apartados || []);

    } catch (error) {
        contenedorDispositivos.innerHTML = `<p class="papelera-mensaje-vacio">Error: ${error.message}</p>`;
        contenedorApartados.innerHTML = '';
    }
}



/* @galaxiahfast - Renderiza la lista de dispositivos eliminados con botones de restaurar y eliminar definitivo. */
function renderizarDispositivosEliminados(contenedor, dispositivos) {
    contenedor.innerHTML = '';

    if (dispositivos.length === 0) {
        contenedor.innerHTML = '<p class="papelera-mensaje-vacio">Sin dispositivos eliminados.</p>';
        return;
    }

    dispositivos.forEach(dispositivo => {
        const fila = document.createElement('div');
        fila.className = 'papelera-item-fila';
        fila.innerHTML = `
            <div class="papelera-info-bloque">
                <div class="papelera-icono-tipo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>
                </div>
                <div class="papelera-detalles-texto">
                    <span class="papelera-nombre-texto">Dispositivo #${dispositivo.id}</span>
                    <span class="papelera-fecha-texto">${formatearFecha(dispositivo.fechaEliminacion)}</span>
                </div>
            </div>
            <div class="papelera-grupo-botones">
                <button class="papelera-btn-accion btn-restaurar-dispositivo" data-id="${dispositivo.id}" title="Restaurar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                </button>
                <button class="papelera-btn-accion btn-eliminar-definitivo-dispositivo" data-id="${dispositivo.id}" title="Eliminar definitivamente">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        `;
        contenedor.appendChild(fila);
    });
}



/* @galaxiahfast - Renderiza la lista de apartados eliminados con botones de restaurar y eliminar definitivo. */
function renderizarApartadosEliminados(contenedor, apartados) {
    contenedor.innerHTML = '';

    if (apartados.length === 0) {
        contenedor.innerHTML = '<p class="papelera-mensaje-vacio">Sin apartados eliminados.</p>';
        return;
    }

    apartados.forEach(apartado => {
        const fila = document.createElement('div');
        fila.className = 'papelera-item-fila';
        fila.innerHTML = `
            <div class="papelera-info-bloque">
                <div class="papelera-icono-tipo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                </div>
                <div class="papelera-detalles-texto">
                    <span class="papelera-nombre-texto">${apartado.nombreApartado}</span>
                    <span class="papelera-fecha-texto">${formatearFecha(apartado.fechaEliminacion)}</span>
                </div>
            </div>
            <div class="papelera-grupo-botones">
                <button class="papelera-btn-accion btn-restaurar-apartado" data-nombre="${apartado.nombreApartado}" title="Restaurar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                </button>
                <button class="papelera-btn-accion btn-eliminar-definitivo-apartado" data-nombre="${apartado.nombreApartado}" title="Eliminar definitivamente">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        `;
        contenedor.appendChild(fila);
    });
}



/* @galaxiahfast - Formatea una fecha ISO a un formato legible en español. */
function formatearFecha(fechaISO) {
    if (!fechaISO) return 'Sin fecha';
    const fecha = new Date(fechaISO);
    const formato = new Intl.DateTimeFormat('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    }).formatToParts(fecha);
    const p = {};
    formato.forEach(({ type, value }) => { p[type] = value; });
    const mes = p.month.charAt(0).toUpperCase() + p.month.slice(1).replace('.', '');
    return `${p.day}, ${mes}. ${p.year} ${p.hour}:${p.minute} ${p.dayPeriod.toUpperCase()}`;
}



/* ==========================================================================
   @galaxiahfast - CONTROLADORES DE ACCIONES
   ========================================================================== */



/* @galaxiahfast - Maneja los clics en los botones de acción de la papelera. */
async function manejarAccionPapelera(event) {
    const botonRestaurarDispositivo = event.target.closest('.btn-restaurar-dispositivo');
    const botonEliminarDispositivo = event.target.closest('.btn-eliminar-definitivo-dispositivo');
    const botonRestaurarApartado = event.target.closest('.btn-restaurar-apartado');
    const botonEliminarApartado = event.target.closest('.btn-eliminar-definitivo-apartado');

    try {
        if (botonRestaurarDispositivo) {
            const id = parseInt(botonRestaurarDispositivo.dataset.id);
            const res = await DispositivosAPI.restaurar(id);
            if (res.estado !== 'exito') throw new Error(res.mensaje);
            await sincronizarDispositivos();
            await cargarElementosPapelera();
        }

        if (botonEliminarDispositivo) {
            const id = parseInt(botonEliminarDispositivo.dataset.id);
            const res = await DispositivosAPI.eliminarDefinitivo(id);
            if (res.estado !== 'exito') throw new Error(res.mensaje);
            await cargarElementosPapelera();
        }

        if (botonRestaurarApartado) {
            const nombre = botonRestaurarApartado.dataset.nombre;
            const res = await ApartadosAPI.restaurar(nombre);
            if (res.estado !== 'exito') throw new Error(res.mensaje);
            await sincronizarApartados();
            await cargarElementosPapelera();
        }

        if (botonEliminarApartado) {
            const nombre = botonEliminarApartado.dataset.nombre;
            const res = await ApartadosAPI.eliminarDefinitivo(nombre);
            if (res.estado !== 'exito') throw new Error(res.mensaje);
            await cargarElementosPapelera();
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}



/* @galaxiahfast - Abre el panel de la papelera y carga los elementos. */
export function abrirPanelPapelera() {
    const contenedor = document.getElementById('contenedorFlotantePapelera');
    if (contenedor) {
        contenedor.classList.remove('estado-panel-oculto');
        contenedor.classList.add('panel-formulario-activo');
        cargarElementosPapelera();
    }
}



/* @galaxiahfast - Cierra el panel de la papelera. */
export function cerrarPanelPapelera() {
    const contenedor = document.getElementById('contenedorFlotantePapelera');
    if (contenedor) {
        contenedor.classList.add('estado-panel-oculto');
        contenedor.classList.remove('panel-formulario-activo');
    }
}



/* @galaxiahfast - Inicialización del módulo de papelera. */
export function inicializarModuloPapelera() {
    const panelPapelera = document.getElementById('contenedorFlotantePapelera');
    if (panelPapelera) {
        panelPapelera.addEventListener('click', manejarAccionPapelera);
    }
}
