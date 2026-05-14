/* ==========================================================================
   INICIALIZACIÓN Y CONFIGURACIÓN GLOBAL
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initThemeControl();
    initApartadosManager();
    initGlobalToolEvents();
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
            
            if (!isVisible) {
                UI_CerrarTodosLosModales();
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
   MANEJO DE EVENTOS GLOBALES (CIERRE POR OTROS BOTONES)
   ========================================================================== */
function initGlobalToolEvents() {
    const allButtons = document.querySelectorAll('.tool-btn');
    
    allButtons.forEach(btn => {
        if (btn.id === 'theme-toggle' || btn.id === 'btn-config') return;

        btn.addEventListener('click', () => {
            UI_CerrarTodosLosModales();
            console.log("Otro botón presionado: cerrando formularios activos.");
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
    }
}

function UI_ResetearModalApartados() {
    const inputNombre = document.getElementById('nombre-apartado');
    const inputValor = document.getElementById('valor-default-apartado');
    const actionButton = document.getElementById('btn-accion-apartado');
    
    if (!inputNombre || !inputValor || !actionButton) return;

    actionButton.textContent = "Añadir";
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

    const nombre = inputNombre.value.trim();
    const valor = inputValor.value.trim();

    if (!nombre || !valor) {
        alert("Por favor, llena ambos campos");
        return;
    }

    if (!isWaitingForApartadoConfirmation) {
        actionButton.textContent = "Confirmar";
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

function API_GuardarNuevoApartadoEnJSON(nombre, valor) {
    console.log("Datos listos para enviar:", { apartado: nombre, defecto: valor });
}

function updateThemeIconVisual(iconElement, wasDark) {
    const sunIcon = `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="18.36" x2="5.64" y2="16.92"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    `;
    const moonIcon = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    iconElement.innerHTML = wasDark ? moonIcon : sunIcon;
}