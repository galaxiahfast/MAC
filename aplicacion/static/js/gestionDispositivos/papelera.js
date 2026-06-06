/* @galaxiahfast - Módulo encargado de gestionar la papelera de reciclaje del sistema (restaurar, purgar). */
import { PapeleraAPI, ApartadosAPI, DispositivosAPI } from '../infraestructura/comunicacionHTTP.js';
import { sincronizarApartados } from '../infraestructura/sincronizarApartados.js';
import { sincronizarDispositivos } from '../infraestructura/sincronizarDispositivos.js';
import { mostrarNotificacion } from '../otros/sistemaNotificaciones.js';

/* ==========================================================================
   @galaxiahfast - LÓGICA DEL PANEL DE PAPELERA
   ========================================================================== */



/* @galaxiahfast - Abre el panel de papelera y carga los elementos eliminados. */
export function abrirPanelPapelera() {
    const panel = document.getElementById('contenedorFlotantePapelera');
    if (panel) {
        panel.classList.remove('estado-panel-oculto');
        panel.classList.add('panel-formulario-activo');
        cargarElementosPapelera();
    }
}



/* @galaxiahfast - Cierra el panel de papelera. */
export function cerrarPanelPapelera() {
    const panel = document.getElementById('contenedorFlotantePapelera');
    if (panel) {
        panel.classList.add('estado-panel-oculto');
        panel.classList.remove('panel-formulario-activo');
    }
}



/* @galaxiahfast - Carga y renderiza los elementos eliminados desde el servidor. */
async function cargarElementosPapelera() {
    try {
        const res = await PapeleraAPI.listar();
        if (res.estado !== 'exito') throw new Error(res.mensaje);

        renderizarListaPapelera(res.dispositivos || [], res.apartados || []);
    } catch (error) {
        mostrarNotificacion('No se pudo cargar la papelera: ' + error.message, 'error');
    }
}



/* @galaxiahfast - Renderiza las listas de dispositivos y apartados eliminados en el panel. */
function renderizarListaPapelera(dispositivos, apartados) {
    const listaDispositivos = document.getElementById('listaPapeleraDispositivos');
    const listaApartados = document.getElementById('listaPapeleraApartados');

    if (listaDispositivos) {
        listaDispositivos.innerHTML = '';
        if (dispositivos.length === 0) {
            listaDispositivos.innerHTML = '<p class="papelera-lista-vacia">No hay dispositivos eliminados.</p>';
        } else {
            dispositivos.forEach(d => {
                const fila = crearFilaPapelera(
                    `Dispositivo #${d.id}`,
                    d.fechaEliminacion,
                    () => restaurarDispositivo(d.id),
                    () => purgarDispositivo(d.id)
                );
                listaDispositivos.appendChild(fila);
            });
        }
    }

    if (listaApartados) {
        listaApartados.innerHTML = '';
        if (apartados.length === 0) {
            listaApartados.innerHTML = '<p class="papelera-lista-vacia">No hay apartados eliminados.</p>';
        } else {
            apartados.forEach(a => {
                const fila = crearFilaPapelera(
                    a.nombreApartado,
                    a.fechaEliminacion,
                    () => restaurarApartado(a.nombreApartado),
                    () => purgarApartado(a.nombreApartado)
                );
                listaApartados.appendChild(fila);
            });
        }
    }
}



/* @galaxiahfast - Crea una fila de elemento de papelera con botones de restaurar y purgar. */
function crearFilaPapelera(nombre, fecha, onRestaurar, onPurgar) {
    const fila = document.createElement('div');
    fila.className = 'papelera-item-fila';

    const fechaFormateada = fecha ? new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

    fila.innerHTML = `
        <div class="papelera-item-info">
            <span class="papelera-item-nombre">${nombre}</span>
            <span class="papelera-item-fecha">${fechaFormateada}</span>
        </div>
        <div class="papelera-item-acciones">
            <button class="papelera-btn-restaurar" title="Restaurar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
            </button>
            <button class="papelera-btn-purgar" title="Eliminar definitivamente">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        </div>
    `;

    fila.querySelector('.papelera-btn-restaurar').addEventListener('click', onRestaurar);

    /* @galaxiahfast - Confirmación de seguridad antes de purgar definitivamente. */
    fila.querySelector('.papelera-btn-purgar').addEventListener('click', () => {
        if (confirm(`¿Eliminar "${nombre}" definitivamente? Esta acción no se puede deshacer.`)) {
            onPurgar();
        }
    });

    return fila;
}



/* @galaxiahfast - Restaura un dispositivo desde la papelera. */
async function restaurarDispositivo(idDispositivo) {
    try {
        const res = await DispositivosAPI.restaurar(idDispositivo);
        if (res.estado !== 'exito') throw new Error(res.mensaje);
        mostrarNotificacion('Dispositivo restaurado correctamente', 'exito');
        await sincronizarDispositivos();
        await cargarElementosPapelera();
    } catch (error) {
        mostrarNotificacion('No se pudo restaurar: ' + error.message, 'error');
    }
}



/* @galaxiahfast - Purga definitivamente un dispositivo. */
async function purgarDispositivo(idDispositivo) {
    try {
        const res = await DispositivosAPI.eliminarDefinitivo(idDispositivo);
        if (res.estado !== 'exito') throw new Error(res.mensaje);
        mostrarNotificacion('Dispositivo eliminado definitivamente', 'exito');
        await cargarElementosPapelera();
    } catch (error) {
        mostrarNotificacion('No se pudo eliminar: ' + error.message, 'error');
    }
}



/* @galaxiahfast - Restaura un apartado desde la papelera. */
async function restaurarApartado(nombreApartado) {
    try {
        const res = await ApartadosAPI.restaurar(nombreApartado);
        if (res.estado !== 'exito') throw new Error(res.mensaje);
        mostrarNotificacion('Apartado restaurado correctamente', 'exito');
        await sincronizarApartados();
        await cargarElementosPapelera();
    } catch (error) {
        mostrarNotificacion('No se pudo restaurar: ' + error.message, 'error');
    }
}



/* @galaxiahfast - Purga definitivamente un apartado. */
async function purgarApartado(nombreApartado) {
    try {
        const res = await ApartadosAPI.eliminarDefinitivo(nombreApartado);
        if (res.estado !== 'exito') throw new Error(res.mensaje);
        mostrarNotificacion('Apartado eliminado definitivamente', 'exito');
        await cargarElementosPapelera();
    } catch (error) {
        mostrarNotificacion('No se pudo eliminar: ' + error.message, 'error');
    }
}



/* @galaxiahfast - Inicialización del módulo de papelera. */
export function inicializarModuloPapelera() {
    /* @galaxiahfast - No se requiere inicialización adicional; la carga se ejecuta al abrir el panel. */
}
