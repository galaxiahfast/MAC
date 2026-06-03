/* @galaxiahfast - Panel de gestión de apartados globales. Implementa renderizado reactivo y sincronización mutua. */
import { getApartados, suscribirse } from '../infraestructura/memoriaCache.js';
import { eliminarApartado } from '../infraestructura/sincronizarApartados.js';

let botonAlternarPanel = null;

/* @galaxiahfast - Motor de renderizado. */
function renderizarListaApartados() {
    const contenedorLista = document.getElementById('listaScrollGestionApartados');
    const template = document.getElementById('templateFilaApartado');
    const apartados = getApartados();
    
    if (!contenedorLista || !template) return;
    
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
    const panelHermano = document.getElementById('contenedorFlotanteRegistroApartadoGlobal');
    botonAlternarPanel = document.getElementById('botonEliminarApartadosExistentesDispositivos');

    // 1. Suscripción reactiva: Renderiza si el panel está abierto cuando los datos cambien.
    suscribirse(() => {
        if (contenedorFlotante && !contenedorFlotante.classList.contains('estado-panel-oculto')) {
            renderizarListaApartados();
        }
    });

    // 2. Renderizado inicial: Intenta cargar datos tras un breve delay para asegurar la sincronización de main.js
    setTimeout(renderizarListaApartados, 300);

    // 3. Lógica de apertura/cierre
    if (botonAlternarPanel && contenedorFlotante) {
        botonAlternarPanel.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Exclusión mutua: Cierra el otro panel
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

    // 4. Protección contra clics propagados
    if (contenedorFlotante) contenedorFlotante.addEventListener('click', (e) => e.stopPropagation());

    // 5. Cierre global
    document.addEventListener('click', (event) => {
        if (!contenedorFlotante || contenedorFlotante.classList.contains('estado-panel-oculto')) return;
        const clickBoton = botonAlternarPanel && botonAlternarPanel.contains(event.target);
        if (!clickBoton) {
            contenedorFlotante.classList.add('estado-panel-oculto');
            if (botonAlternarPanel) botonAlternarPanel.classList.remove('activo');
        }
    });
});