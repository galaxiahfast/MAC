import { getApartados, suscribirse } from '../infraestructura/memoriaCache.js';
import { eliminarApartado } from '../infraestructura/sincronizarApartados.js';

let botonAlternarPanel = null;

function renderizarListaApartados() {
    const contenedorLista = document.getElementById('listaScrollGestionApartados');
    const template = document.getElementById('templateFilaApartado');
    const apartados = getApartados();
    contenedorLista.innerHTML = '';
    apartados.forEach(apartado => {
        const clon = template.content.cloneNode(true);
        clon.querySelector('.gestionar-apartado-nombre-texto').textContent = apartado.nombre;
        clon.querySelector('.btn-eliminar').addEventListener('click', () => eliminarApartado(apartado.nombre));
        contenedorLista.appendChild(clon);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const contenedorFlotante = document.getElementById('contenedorFlotanteGestionApartado');
    const panelHermano = document.getElementById('contenedorFlotanteRegistroApartadoGlobal'); // Referencia al otro panel
    botonAlternarPanel = document.getElementById('botonEliminarApartadosExistentesDispositivos');

    suscribirse(() => {
        if (contenedorFlotante && !contenedorFlotante.classList.contains('estado-panel-oculto')) {
            renderizarListaApartados();
        }
    });

    if (botonAlternarPanel && contenedorFlotante) {
        botonAlternarPanel.addEventListener('click', (e) => {
            e.stopPropagation();
            // Cierra el hermano si está abierto
            if (panelHermano) {
                panelHermano.classList.add('estado-panel-oculto');
                const btnHermano = document.getElementById('botonRegistrarNuevoApartadoGlobalDispositivos');
                if (btnHermano) btnHermano.classList.remove('activo');
            }

            const estaOculto = contenedorFlotante.classList.contains('estado-panel-oculto');
            if (estaOculto) {
                renderizarListaApartados();
                contenedorFlotante.classList.remove('estado-panel-oculto');
                botonAlternarPanel.classList.add('activo');
            } else {
                contenedorFlotante.classList.add('estado-panel-oculto');
                botonAlternarPanel.classList.remove('activo');
            }
        });
    }

    if (contenedorFlotante) contenedorFlotante.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('click', (event) => {
        if (!contenedorFlotante || contenedorFlotante.classList.contains('estado-panel-oculto')) return;
        const clickBoton = botonAlternarPanel && botonAlternarPanel.contains(event.target);
        if (!clickBoton) {
            contenedorFlotante.classList.add('estado-panel-oculto');
            if (botonAlternarPanel) botonAlternarPanel.classList.remove('activo');
        }
    });
});