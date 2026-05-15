/* ==========================================================================
   INICIALIZACIÓN Y CONFIGURACIÓN GLOBAL
   ========================================================================== */
let datosApartadosGlobal = [];
let isWaitingForApartadoConfirmation = false;

document.addEventListener('DOMContentLoaded', async () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    const icon = document.getElementById('theme-icon');
    if (icon) updateThemeIconVisual(icon, savedTheme === 'dark');

    initThemeControl();
    initApartadosManager();
    initGlobalToolEvents();
    initEliminarApartadosManager();
    
    await API_PrecargarDatosApartados();
});

async function API_PrecargarDatosApartados() {
    try {
        const response = await fetch('/static/data/dispositivos.json');
        const data = await response.json();
        datosApartadosGlobal = data.configuracion.apartados;
    } catch (error) {
        UI_MostrarNotificacion("No se pudieron precargar los parámetros", "error");
    }
}

/* ==========================================================================
   CONTROL DE TEMA (DARK / LIGHT MODE)
   ========================================================================== */
function initThemeControl() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = document.getElementById('theme-icon');

    if (!themeToggle || !icon) return;

    themeToggle.addEventListener('click', (e) => {
        e.stopPropagation(); 
        const isDark = body.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIconVisual(icon, isDark);
    });
}

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
   LÓGICA DE ELIMINACIÓN: LISTADO Y CONFIRMACIÓN
   ========================================================================== */
function initEliminarApartadosManager() {
    const btnDeleteTool = document.getElementById('btn-delete-params');
    const modalElement = document.getElementById('modal-config');
    
    if (btnDeleteTool) {
        btnDeleteTool.onclick = (e) => {
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
                UI_RenderizarListaEliminacion(datosApartadosGlobal);
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
            UI_MostrarNotificacion(data.message || "Parámetro eliminado", "success");
            datosApartadosGlobal = datosApartadosGlobal.filter(item => item !== nombre);
            UI_RenderizarListaEliminacion(datosApartadosGlobal);
        } else {
            UI_MostrarNotificacion(data.message || "No se pudo eliminar el parámetro", "error");
        }
    } catch (error) {
        UI_MostrarNotificacion("No se pudo conectar con la base de datos", "error");
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
        UI_MostrarNotificacion("Faltan datos en el formulario para enviar", "warning");
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
            UI_MostrarNotificacion(data.message || "Se agregó el nuevo parámetro", "success");
            datosApartadosGlobal.push(nombre);
            UI_CerrarTodosLosModales();
        } else {
            UI_MostrarNotificacion(data.message || "El parámetro enviado no es válido", "error");
            UI_HabilitarBotonTrasError();
        }
    } catch (error) {
        UI_MostrarNotificacion("No se pudo conectar con la base de datos", "error");
        UI_HabilitarBotonTrasError();
    }
}

/* ==========================================================================
   SISTEMA DE NOTIFICACIONES (FRONT-END LOGIC)
   ========================================================================== */
function UI_MostrarNotificacion(mensaje, tipo = "warning") {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = mensaje;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/* ==========================================================================
   FUNCIONES DE UTILIDAD Y RESETEO
   ========================================================================== */
function UI_CerrarTodosLosModales() {
    const modalConfig = document.getElementById('modal-config');
    if (modalConfig) {
        modalConfig.style.display = 'none';
        UI_ResetearModalApartados();
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

function UI_RenderizarListaEliminacion(apartados) {
    const listaContenedor = document.getElementById('lista-apartados-existentes');
    if (!listaContenedor) return;
    listaContenedor.innerHTML = "";
    apartados.forEach(nombre => {
        const item = document.createElement('div');
        item.className = 'delete-item-row'; 
        item.innerHTML = `
            <span class="caps-text" style="font-size:11px;">${nombre}</span>
            <button class="btn-delete-small" onclick="UI_ConfirmarEliminacion('${nombre}', this)">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;
        listaContenedor.appendChild(item);
    });
}

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

function initGlobalToolEvents() {
    const allButtons = document.querySelectorAll('.tool-btn');
    allButtons.forEach(btn => {
        if (btn.id === 'theme-toggle' || btn.id === 'btn-config' || btn.id === 'btn-delete-params') return;
        btn.addEventListener('click', () => UI_CerrarTodosLosModales());
    });
}

function updateThemeIconVisual(iconElement, wasDark) {
    const sunIcon = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="18.36" x2="5.64" y2="16.92"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
    const moonIcon = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    iconElement.innerHTML = wasDark ? moonIcon : sunIcon;
}