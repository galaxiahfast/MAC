/* ==========================================================================
   GESTIÓN DE APARTADOS (PARÁMETROS GLOBALES)
   ========================================================================== */

let datosApartadosGlobal = [];
let datosEliminacionCache = null;
let datosAgregarCache = null;
let isWaitingForApartadoConfirmation = false;

/* ==========================================================================
   GESTIÓN DE APARTADOS: CONTROL DE VISIBILIDAD E INTERRUPTOR
   ========================================================================== */
function initApartadosManager() {
    const btnOpenConfig = document.getElementById('btn-config');
    const modalElement = document.getElementById('modal-config');

    if (btnOpenConfig && modalElement) {
        btnOpenConfig.onclick = (e) => {
            e.stopPropagation();
            const isVisible = modalElement.style.display === 'flex';
            const isAgregarVisible = document.getElementById('contenedor-agregar').style.display === 'block';

            if (isVisible && isAgregarVisible) {
                modalElement.style.display = 'none';
                UI_ResetearModalApartados();
            } else {
                UI_CerrarTodosLosModales();
                document.getElementById('contenedor-agregar').style.display = 'block';
                document.getElementById('contenedor-eliminar').style.display = 'none';
                modalElement.style.display = 'flex';
            }
        };

        modalElement.onclick = (e) => {
            if (e.target === modalElement) {
                modalElement.style.display = 'none';
                UI_ResetearModalApartados();
            }
        };
    }
}

/* ==========================================================================
   LÓGICA DE ELIMINACIÓN: LISTADO Y CONFIRMACIÓN (OPTIMIZADA - SIN CORTE)
   ========================================================================== */
function initEliminarApartadosManager() {
    const btnDeleteTool = document.getElementById('btn-delete-params');
    const modalElement = document.getElementById('modal-config');
    
    if (btnDeleteTool) {
        btnDeleteTool.onclick = async (e) => {
            e.stopPropagation();
            const isVisible = modalElement.style.display === 'flex';
            const isEliminarVisible = document.getElementById('contenedor-eliminar').style.display === 'block';

            if (isVisible && isEliminarVisible) {
                modalElement.style.display = 'none';
                UI_ResetearModalApartados();
            } else {
                UI_CerrarTodosLosModales();
                document.getElementById('contenedor-agregar').style.display = 'none';
                document.getElementById('contenedor-eliminar').style.display = 'block';
                
                /* ⚡ Usar caché unificado */
                if (window.cacheEliminacion) {
                    UI_RenderizarListaEliminacion(window.cacheEliminacion);
                } else {
                    UI_RenderizarListaEliminacion([], true);
                    await cargarApartados();
                    UI_RenderizarListaEliminacion(window.cacheEliminacion);
                }
                
                modalElement.style.display = 'flex';
            }
        };
    }
}

async function API_EliminarApartadoEnJSON(nombre) {
    try {
        const respuesta = await fetch('/api/config/apartados/eliminar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_apartado: nombre })
        });
        const data = await respuesta.json();

        if (respuesta.ok) {
            mostrarNotificacion(data.message || "Parámetro eliminado", "exito");
            await cargarApartados(true);  // Forzar recarga
            UI_RenderizarListaEliminacion(window.cacheEliminacion);
        } else {
            mostrarNotificacion(data.message || "No se pudo eliminar el parámetro", "error");
        }
    } catch (error) {
        console.error("Error en eliminación:", error);
        mostrarNotificacion("No se pudo conectar con la base de datos", "error");
    }
}

/* ==========================================================================
   PROCESO DE GUARDADO Y VALIDACIÓN DE FORMULARIO
   ========================================================================== */
function UI_ManejarCicloConfirmacionApartado() {
    const inputNombre = document.getElementById('nombre-apartado');
    const inputValor = document.getElementById('valor-default-apartado');
    const actionButton = document.getElementById('btn-accion-apartado');

    const nombre = inputNombre.value.trim().toUpperCase();
    const valor = inputValor.value.trim();

    if (!nombre || !valor) {
        mostrarNotificacion("Faltan datos en el formulario para enviar", "advertencia");
        return;
    }

    if (!isWaitingForApartadoConfirmation) {
        actionButton.innerHTML = '<span class="confirm-text">Confirmar</span>';
        actionButton.classList.add('confirm-mode');
        inputNombre.disabled = true;
        inputValor.disabled = true;
        isWaitingForApartadoConfirmation = true;
    } else {
        API_GuardarNuevoApartadoEnJSON(nombre, valor);
    }
}

async function API_GuardarNuevoApartadoEnJSON(nombre, valor) {
    try {
        const respuesta = await fetch('/api/config/apartados', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_apartado: nombre, valor_predeterminado: valor })
        });
        const data = await respuesta.json();

        if (respuesta.ok) {
            mostrarNotificacion(data.message || "Se agregó el nuevo parámetro", "exito");
            await cargarApartados(true);  // Forzar recarga
            UI_ResetearModalApartados();  
        } else {
            mostrarNotificacion(data.message || "El parámetro enviado no es válido", "error");
            UI_HabilitarBotonTrasError();
        }
    } catch (error) {
        console.error("Error al guardar:", error);
        mostrarNotificacion("No se pudo conectar con la base de datos", "error");
        UI_HabilitarBotonTrasError();
    }
}

/* ==========================================================================
   FUNCIONES DE UTILIDAD Y RESETEO
   ========================================================================== */
function UI_CerrarTodosLosModales() {
    // Cerrar modal de configuración de parámetros
    const modalConfig = document.getElementById('modal-config');
    if (modalConfig) {
        modalConfig.style.display = 'none';
        UI_ResetearModalApartados();
    }
    
    // Cerrar modal de agregar punto
    const modalAgregarPunto = document.getElementById('modal-agregar-punto');
    if (modalAgregarPunto) {
        modalAgregarPunto.style.display = 'none';
        if (typeof UI_ResetearFormularioAgregarPunto === 'function') {
            UI_ResetearFormularioAgregarPunto();
        }
    }
}

function UI_ResetearModalApartados() {
    const inputNombre = document.getElementById('nombre-apartado');
    const inputValor = document.getElementById('valor-default-apartado');
    const actionButton = document.getElementById('btn-accion-apartado');
    
    if (!inputNombre || !inputValor || !actionButton) return;

    actionButton.innerHTML = "Añadir";
    actionButton.classList.remove('confirm-mode');
    inputNombre.disabled = false;
    inputValor.disabled = false;
    inputNombre.value = "";
    inputValor.value = "";
    isWaitingForApartadoConfirmation = false;
    
    inputNombre.focus();
}

function UI_HabilitarBotonTrasError() {
    const actionButton = document.getElementById('btn-accion-apartado');
    if (!actionButton) return;
    actionButton.classList.remove('confirm-mode');
    actionButton.innerHTML = "Añadir";
    document.getElementById('nombre-apartado').disabled = false;
    document.getElementById('valor-default-apartado').disabled = false;
    isWaitingForApartadoConfirmation = false;
}

// Función para ajustar el padding derecho del contenedor según si hay scroll
function ajustarPaddingContenedorEliminacion() {
    const listaContenedor = document.getElementById('lista-apartados-existentes');
    if (!listaContenedor) return;
    
    void listaContenedor.offsetHeight;
    
    const tieneScroll = listaContenedor.scrollHeight > listaContenedor.clientHeight + 5;
    
    if (tieneScroll) {
        // Con scroll: padding derecho de 30px para dejar espacio al scrollbar
        listaContenedor.style.paddingRight = '30px';
    } else {
        // Sin scroll: padding derecho igual al izquierdo (20px) para simetría
        listaContenedor.style.paddingRight = '20px';
    }
}

// Función para ajustar la altura del contenedor (exactamente 3 elementos visibles)
function ajustarAlturaListaEliminacion() {
    const listaContenedor = document.getElementById('lista-apartados-existentes');
    if (!listaContenedor) return;
    
    listaContenedor.style.maxHeight = '';
    listaContenedor.style.height = 'auto';
    
    setTimeout(() => {
        const items = listaContenedor.querySelectorAll('.delete-item-row');
        
        if (items.length === 0) {
            listaContenedor.style.maxHeight = '';
            listaContenedor.style.height = 'auto';
            ajustarPaddingContenedorEliminacion();
            return;
        }
        
        const alturaItem = items[0].offsetHeight;
        const gap = 12;
        const paddingVertical = 16;  // padding top + padding bottom (8px + 8px)
        
        const elementosAMostrar = Math.min(3, items.length);
        const alturaTotal = (elementosAMostrar * alturaItem) + ((elementosAMostrar - 1) * gap) + paddingVertical;
        
        listaContenedor.style.maxHeight = alturaTotal + 'px';
        listaContenedor.style.height = alturaTotal + 'px';
        
        setTimeout(() => {
            ajustarPaddingContenedorEliminacion();
        }, 20);
    }, 10);
}

function UI_RenderizarListaEliminacion(apartados, isLoading = false) {
    const listaContenedor = document.getElementById('lista-apartados-existentes');
    if (!listaContenedor) return;
    
    if (isLoading) {
        listaContenedor.innerHTML = '<div class="delete-item-row"><span>Cargando...</span></div>';
        ajustarAlturaListaEliminacion();
        return;
    }
    
    if (!apartados || apartados.length === 0) {
        listaContenedor.innerHTML = '<div class="delete-item-row"><span>No hay parámetros para eliminar</span></div>';
        ajustarAlturaListaEliminacion();
        return;
    }
    
    listaContenedor.innerHTML = "";
    apartados.forEach(nombre => {
        const item = document.createElement('div');
        item.className = 'delete-item-row';
        
        const nombreEscapado = nombre.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        item.innerHTML = `
            <span class="caps-text" style="font-size:11px;">${manejoCaracteresEspeciales(nombre)}</span>
            <button class="btn-delete-small" onclick="UI_ConfirmarEliminacion('${nombreEscapado}', this)">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;
        listaContenedor.appendChild(item);
    });
    
    ajustarAlturaListaEliminacion();
}

// Event listener para resize
window.addEventListener('resize', () => {
    const modalEliminar = document.getElementById('contenedor-eliminar');
    if (modalEliminar && modalEliminar.style.display === 'block') {
        ajustarAlturaListaEliminacion();
    }
});

function UI_ConfirmarEliminacion(nombre, boton) {
    if (!boton.classList.contains('confirming')) {
        boton.classList.add('confirming');
        boton.innerHTML = '<span class="confirm-text">Confirmar</span>';
        setTimeout(() => {
            if (boton && boton.classList.contains('confirming')) {
                boton.classList.remove('confirming');
                boton.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
            }
        }, 3000);
    } else {
        API_EliminarApartadoEnJSON(nombre);
    }
}