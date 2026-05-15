/* ==========================================================================
   INICIALIZACIÓN Y CONFIGURACIÓN GLOBAL
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initThemeControl();
    initApartadosManager();
    initGlobalToolEvents();
    initEliminarApartadosManager();
});

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
        updateThemeIconVisual(icon, isDark);
    });
}

/* ==========================================================================
   GESTIÓN DE APARTADOS: CONTROL DE VISIBILIDAD E INTERRUPTOR
   ========================================================================== */
let isWaitingForApartadoConfirmation = false;

function initApartadosManager() {
    const btnOpenConfig = document.getElementById('btn-config');
    const modalElement = document.getElementById('modal-config');

    if (btnOpenConfig && modalElement) {
        btnOpenConfig.onclick = (e) => {
            e.stopPropagation();
            
            const isVisible = modalElement.style.display === 'flex';
            const isAgregarVisible = document.getElementById('contenedor-agregar').style.display === 'block';

            if (!isVisible || !isAgregarVisible) {
                UI_CerrarTodosLosModales();
                
                document.getElementById('contenedor-agregar').style.display = 'block';
                document.getElementById('contenedor-eliminar').style.display = 'none';
                
                modalElement.style.display = 'flex';
            } else {
                modalElement.style.display = 'none';
                UI_ResetearModalApartados();
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
        btnDeleteTool.onclick = async (e) => {
            e.stopPropagation();
            UI_CerrarTodosLosModales();
            
            document.getElementById('contenedor-agregar').style.display = 'none';
            document.getElementById('contenedor-eliminar').style.display = 'block';
            
            modalElement.style.display = 'flex';
            await UI_RenderizarListaEliminacion();
        };
    }
}

async function UI_RenderizarListaEliminacion() {
    const listaContenedor = document.getElementById('lista-apartados-existentes');
    if (!listaContenedor) return;

    listaContenedor.innerHTML = "";

    try {
        const response = await fetch('/static/data/dispositivos.json');
        const data = await response.json();
        const apartados = data.configuracion.apartados;

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
    } catch (error) {
        console.error("Error al cargar apartados:", error);
    }
}

function UI_ConfirmarEliminacion(nombre, boton) {
    if (!boton.classList.contains('confirming')) {
        boton.classList.add('confirming');
        // Envolvemos en span con clase específica para el CSS
        boton.innerHTML = '<span class="confirm-text">Confirmar</span>';
        
        setTimeout(() => {
            if (boton) {
                boton.classList.remove('confirming');
                boton.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
            }
        }, 3000);
    } else {
        API_EliminarApartadoEnJSON(nombre);
    }
}

async function API_EliminarApartadoEnJSON(nombre) {
    try {
        const respuesta = await fetch('/api/config/apartados/eliminar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_apartado: nombre })
        });

        if (respuesta.ok) {
            location.reload();
        }
    } catch (error) {
        console.error("Error en la eliminación:", error);
    }
}

/* ==========================================================================
   MANEJO DE EVENTOS GLOBALES (CIERRE POR OTROS BOTONES)
   ========================================================================== */
function initGlobalToolEvents() {
    const allButtons = document.querySelectorAll('.tool-btn');
    
    allButtons.forEach(btn => {
        if (btn.id === 'theme-toggle' || btn.id === 'btn-config' || btn.id === 'btn-delete-params') return;

        btn.addEventListener('click', () => {
            UI_CerrarTodosLosModales();
        });
    });
}

/* ==========================================================================
   LIMPIEZA Y RESETEO DE INTERFAZ
   ========================================================================== */
function UI_CerrarTodosLosModales() {
    const modalConfig = document.getElementById('modal-config');
    if (modalConfig) {
        modalConfig.style.display = 'none';
        UI_ResetearModalApartados();
        document.getElementById('lista-apartados-existentes').innerHTML = "";
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

function UI_ManejarCicloConfirmacionApartado() {
    const inputNombre = document.getElementById('nombre-apartado');
    const inputValor = document.getElementById('valor-default-apartado');
    const actionButton = document.getElementById('btn-accion-apartado');

    if (!inputNombre || !inputValor || !actionButton) return;

    const nombre = inputNombre.value.trim().toUpperCase();
    const valor = inputValor.value.trim();

    if (!nombre || !valor) {
        alert("Por favor, llena ambos campos");
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
        UI_ResetearModalApartados();
        document.getElementById('modal-config').style.display = 'none';
    }
}

async function API_GuardarNuevoApartadoEnJSON(nombre, valor) {
    try {
        const respuesta = await fetch('/api/config/apartados', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nombre_apartado: nombre, 
                valor_predeterminado: valor 
            })
        });

        if (respuesta.ok) {
            location.reload();
        }
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
    }
}

function updateThemeIconVisual(iconElement, wasDark) {
    const sunIcon = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="18.36" x2="5.64" y2="16.92"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
    const moonIcon = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    iconElement.innerHTML = wasDark ? moonIcon : sunIcon;
}