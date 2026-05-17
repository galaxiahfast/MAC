/* ==========================================================================
   INICIALIZACIÓN Y CONFIGURACIÓN GLOBAL
   ========================================================================== */
let datosApartadosGlobal = [];
let datosEliminacionCache = null;
let datosAgregarCache = null;
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
    initAgregarPuntoManager();
    
    // 🚀 Precargar datos en segundo plano
    setTimeout(() => {
        PrecargarDatosEliminacion();
        PrecargarDatosAgregar();
    }, 100);
    
    await API_PrecargarDatosApartados();
    
    // ✅ CARGAR TODOS LOS DISPOSITIVOS EXISTENTES EN EL MAPA
    await CargarTodosLosDispositivos();
});

// 🆕 Función para precargar datos de eliminación en background
async function PrecargarDatosEliminacion() {
    if (datosEliminacionCache) return datosEliminacionCache;
    
    try {
        const response = await fetch('/api/config/apartados/listar');
        const data = await response.json();
        if (data.status === 'success') {
            datosEliminacionCache = data.apartados;
            console.log("🗑️ Datos de eliminación precargados:", datosEliminacionCache);
        }
        return datosEliminacionCache;
    } catch (error) {
        console.error("Error precargando datos de eliminación:", error);
        return [];
    }
}

async function API_PrecargarDatosApartados() {
    try {
        const response = await fetch('/api/config/apartados/listar');
        const data = await response.json();
        if (data.status === 'success') {
            datosApartadosGlobal = data.apartados;
            // 🔄 Actualizar también el caché de eliminación
            datosEliminacionCache = [...data.apartados];
            console.log("📦 Datos cargados desde API:", datosApartadosGlobal);
        } else {
            throw new Error(data.message);
        }
        return datosApartadosGlobal;
    } catch (error) {
        console.error("Error precargando datos:", error);
        mostrarNotificacion("No se pudieron precargar los parámetros", "error");
        return [];
    }
}

/* ==========================================================================
   CARGA DE DISPOSITIVOS EXISTENTES EN EL MAPA
   ========================================================================== */

async function CargarTodosLosDispositivos() {
    try {
        const response = await fetch('/api/dispositivos/listar');
        const data = await response.json();
        
        console.log("📡 Respuesta del servidor:", data);
        
        if (data.status === 'success') {
            const devicesLayer = document.getElementById('devices-layer');
            if (!devicesLayer) {
                console.error("❌ No se encontró el elemento #devices-layer");
                return;
            }
            
            // Limpiar el layer antes de cargar
            devicesLayer.innerHTML = '';
            
            console.log(`📌 Se encontraron ${data.dispositivos.length} dispositivos en el JSON`);
            
            data.dispositivos.forEach((dispositivo, index) => {
                console.log(`  - Dispositivo ${index + 1}:`, {
                    id: dispositivo.id,
                    x: dispositivo.x,
                    y: dispositivo.y,
                    tipoX: typeof dispositivo.x,
                    tipoY: typeof dispositivo.y
                });
                UI_AgregarPuntoAlMapa(dispositivo, false);
            });
            
            console.log(`✅ Cargados ${data.dispositivos.length} dispositivos en el mapa`);
        } else {
            console.error("❌ Error al cargar dispositivos:", data.message);
        }
    } catch (error) {
        console.error("❌ Error cargando dispositivos:", error);
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
                
                // ⚡ USAR CACHÉ INSTANTÁNEO (sin esperar)
                if (datosEliminacionCache) {
                    UI_RenderizarListaEliminacion(datosEliminacionCache);
                } else {
                    // Primera vez: mostrar loading y cargar
                    UI_RenderizarListaEliminacion([], true); // Modo loading
                    await PrecargarDatosEliminacion();
                    UI_RenderizarListaEliminacion(datosEliminacionCache);
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
            await API_PrecargarDatosApartados();
            
            // 🔄 Actualizar también el caché de agregar punto
            datosAgregarCache = [...datosApartadosGlobal];
            
            UI_RenderizarListaEliminacion(datosApartadosGlobal);
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
            await API_PrecargarDatosApartados();
            
            // 🔄 Actualizar también el caché de agregar punto
            datosAgregarCache = [...datosApartadosGlobal];
            
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
        UI_ResetearFormularioAgregarPunto();
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

// 🛡️ Función para escapar caracteres especiales
function escapeHtml(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
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
            <span class="caps-text" style="font-size:11px;">${escapeHtml(nombre)}</span>
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











/* ==========================================================================
   GESTIÓN DE AGREGAR PUNTO (DISPOSITIVO)
   ========================================================================== */

let datosDispositivoPendiente = null;
let isWaitingForDispositivoConfirmation = false;
let apartadosActivosFormulario = [];

// 🆕 Función para precargar datos de agregar punto en background
async function PrecargarDatosAgregar() {
    if (datosAgregarCache) return datosAgregarCache;
    
    try {
        const response = await fetch('/api/config/apartados/listar');
        const data = await response.json();
        if (data.status === 'success') {
            datosAgregarCache = data.apartados;
            console.log("➕ Datos de agregar precargados:", datosAgregarCache);
        }
        return datosAgregarCache;
    } catch (error) {
        console.error("Error precargando datos de agregar:", error);
        return [];
    }
}

// Función para obtener los apartados activos (usa caché)
async function ObtenerApartadosActivos(forzarRefresh = false) {
    if (!forzarRefresh && datosAgregarCache) {
        apartadosActivosFormulario = datosAgregarCache;
        console.log("📋 Apartados desde caché:", apartadosActivosFormulario);
        return apartadosActivosFormulario;
    }
    
    try {
        const response = await fetch('/api/config/apartados/listar');
        const data = await response.json();
        if (data.status === 'success') {
            apartadosActivosFormulario = data.apartados;
            datosAgregarCache = [...data.apartados];
            console.log("📋 Apartados desde API:", apartadosActivosFormulario);
            return apartadosActivosFormulario;
        }
        return [];
    } catch (error) {
        console.error("Error obteniendo apartados:", error);
        mostrarNotificacion("No se pudieron cargar los campos del formulario", "error");
        return [];
    }
}

// Función para renderizar el formulario dinámico de agregar punto
function UI_RenderizarFormularioAgregarPunto(isLoading = false) {
    const modalElement = document.getElementById('modal-agregar-punto');
    if (!modalElement) return;
    
    const contenidoFormulario = document.getElementById('contenedor-agregar-punto');
    if (!contenidoFormulario) return;
    
    if (isLoading) {
        contenidoFormulario.innerHTML = `
            <div class="modal-icon-container">
                <div class="modal-icon-inner">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                </div>
            </div>
            <h3 class="caps-text">Agregar Nuevo Dispositivo</h3>
            <p class="modal-description caps-text">CARGANDO CAMPOS...</p>
            <div id="formulario-dispositivo-dinamico" class="modal-inputs-stack">
                <div class="input-group">
                    <div class="modern-input" style="text-align:center;">Cargando configuración...</div>
                </div>
            </div>
            <button id="btn-agregar-dispositivo" class="btn-main caps-text" disabled>Agregar Dispositivo</button>
        `;
        return;
    }
    
    // Limpiar y construir el formulario dinámicamente
    contenidoFormulario.innerHTML = `
        <div class="modal-icon-container">
            <div class="modal-icon-inner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
            </div>
        </div>
        <h3 class="caps-text">Agregar Nuevo Dispositivo</h3>
        <p class="modal-description caps-text">COMPLETE LOS SIGUIENTES CAMPOS PARA AGREGAR UN NUEVO PUNTO EN EL PLANO.</p>
        <div id="formulario-dispositivo-dinamico" class="modal-inputs-stack"></div>
        <button id="btn-agregar-dispositivo" class="btn-main caps-text">Agregar Dispositivo</button>
    `;
    
    const contenedorCampos = document.getElementById('formulario-dispositivo-dinamico');
    
    if (apartadosActivosFormulario.length === 0) {
        contenedorCampos.innerHTML = `
            <div class="input-group">
                <span class="input-label caps-text">No hay campos configurados</span>
                <p style="font-size: 11px; color: #64748b; text-align: center; margin-top: 10px;">
                    Primero debe agregar parámetros en la configuración.
                </p>
            </div>
        `;
        const btnAgregar = document.getElementById('btn-agregar-dispositivo');
        if (btnAgregar) btnAgregar.disabled = true;
        return;
    }
    
    // Crear los grupos de campos
    apartadosActivosFormulario.forEach(apartado => {
        const grupo = document.createElement('div');
        grupo.className = 'input-group';
        grupo.innerHTML = `
            <span class="input-label caps-text">${escapeHtml(apartado)}</span>
            <input type="text" id="campo_${escapeHtml(apartado)}" class="modern-input" placeholder="EJ: VALOR" style="text-transform: uppercase;">
        `;
        contenedorCampos.appendChild(grupo);
    });
    
    const btnAgregar = document.getElementById('btn-agregar-dispositivo');
    if (btnAgregar) {
        btnAgregar.disabled = false;
        btnAgregar.onclick = () => UI_ManejarCicloConfirmacionDispositivo();
    }
    
    // Ajustar altura inmediatamente
    setTimeout(() => {
        ajustarAlturaFormularioAgregar();
        ajustarPaddingSegunScroll();
    }, 10);
}

// Función para manejar el ciclo de confirmación del dispositivo
function UI_ManejarCicloConfirmacionDispositivo() {
    const actionButton = document.getElementById('btn-agregar-dispositivo');
    const detalles = {};
    let todosCamposLlenos = true;
    
    apartadosActivosFormulario.forEach(apartado => {
        const input = document.getElementById(`campo_${apartado}`);
        if (input) {
            const valor = input.value.trim().toUpperCase();
            if (!valor) {
                todosCamposLlenos = false;
                input.style.borderColor = '#ef4444';
            } else {
                input.style.borderColor = '';
                detalles[apartado] = valor;
            }
        }
    });
    
    if (!todosCamposLlenos) {
        mostrarNotificacion("Complete todos los campos del formulario", "advertencia");
        return;
    }
    
    if (!isWaitingForDispositivoConfirmation) {
        actionButton.innerHTML = '<span class="confirm-text">Confirmar</span>';
        actionButton.classList.add('confirm-mode');
        apartadosActivosFormulario.forEach(apartado => {
            const input = document.getElementById(`campo_${apartado}`);
            if (input) input.disabled = true;
        });
        isWaitingForDispositivoConfirmation = true;
        datosDispositivoPendiente = detalles;
    } else {
        API_AgregarNuevoDispositivo(datosDispositivoPendiente);
    }
}

async function API_AgregarNuevoDispositivo(detalles) {
    try {
        const respuesta = await fetch('/api/dispositivos/agregar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ detalles: detalles })
        });
        const data = await respuesta.json();
        
        if (respuesta.ok) {
            mostrarNotificacion(data.message || "Dispositivo agregado correctamente", "exito");
            UI_CerrarModalAgregarPunto();
            
            if (data.dispositivo) {
                UI_AgregarPuntoAlMapa(data.dispositivo, true);
            }
        } else {
            mostrarNotificacion(data.message || "No se pudo agregar el dispositivo", "error");
            UI_HabilitarBotonDispositivoTrasError();
        }
    } catch (error) {
        console.error("Error al agregar dispositivo:", error);
        mostrarNotificacion("No se pudo conectar con la base de datos", "error");
        UI_HabilitarBotonDispositivoTrasError();
    }
}

// Función para resetear el formulario de agregar punto
function UI_ResetearFormularioAgregarPunto() {
    const actionButton = document.getElementById('btn-agregar-dispositivo');
    if (!actionButton) return;
    
    actionButton.innerHTML = "Agregar Dispositivo";
    actionButton.classList.remove('confirm-mode');
    
    apartadosActivosFormulario.forEach(apartado => {
        const input = document.getElementById(`campo_${apartado}`);
        if (input) {
            input.disabled = false;
            input.value = "";
            input.style.borderColor = '';
        }
    });
    
    isWaitingForDispositivoConfirmation = false;
    datosDispositivoPendiente = null;
}

// Función para habilitar botón tras error
function UI_HabilitarBotonDispositivoTrasError() {
    const actionButton = document.getElementById('btn-agregar-dispositivo');
    if (!actionButton) return;
    
    actionButton.classList.remove('confirm-mode');
    actionButton.innerHTML = "Agregar Dispositivo";
    
    apartadosActivosFormulario.forEach(apartado => {
        const input = document.getElementById(`campo_${apartado}`);
        if (input) input.disabled = false;
    });
    
    isWaitingForDispositivoConfirmation = false;
    datosDispositivoPendiente = null;
}

// Función para cerrar el modal de agregar punto
function UI_CerrarModalAgregarPunto() {
    const modalElement = document.getElementById('modal-agregar-punto');
    if (modalElement) {
        modalElement.style.display = 'none';
        UI_ResetearFormularioAgregarPunto();
    }
}

// Función para abrir el modal de agregar punto (usando caché)
async function UI_AbrirModalAgregarPunto() {
    UI_CerrarTodosLosModales();
    
    if (datosAgregarCache) {
        apartadosActivosFormulario = datosAgregarCache;
        UI_RenderizarFormularioAgregarPunto();
    } else {
        UI_RenderizarFormularioAgregarPunto(true);
        await ObtenerApartadosActivos(true);
        UI_RenderizarFormularioAgregarPunto();
    }
    
    let modalElement = document.getElementById('modal-agregar-punto');
    
    if (!modalElement) {
        modalElement = document.createElement('div');
        modalElement.id = 'modal-agregar-punto';
        modalElement.className = 'modal-overlay';
        modalElement.style.display = 'none';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        const contenedor = document.createElement('div');
        contenedor.id = 'contenedor-agregar-punto';
        modalContent.appendChild(contenedor);
        modalElement.appendChild(modalContent);
        document.body.appendChild(modalElement);
    }
    
    modalElement.onclick = (e) => {
        if (e.target === modalElement) {
            UI_CerrarModalAgregarPunto();
        }
    };
    
    modalElement.style.display = 'flex';
}

// Inicializar el botón de agregar punto
function initAgregarPuntoManager() {
    const allButtons = document.querySelectorAll('.sidebar-tools .tool-btn');
    let btnAgregarPunto = null;
    
    for (let i = 0; i < allButtons.length; i++) {
        const btn = allButtons[i];
        if (btn.getAttribute('aria-label') === 'Añadir nuevo elemento') {
            btnAgregarPunto = btn;
            break;
        }
    }
    
    if (btnAgregarPunto) {
        const newBtn = btnAgregarPunto.cloneNode(true);
        btnAgregarPunto.parentNode.replaceChild(newBtn, btnAgregarPunto);
        
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const modalElement = document.getElementById('modal-agregar-punto');
            const isVisible = modalElement && modalElement.style.display === 'flex';
            
            if (isVisible) {
                UI_CerrarModalAgregarPunto();
            } else {
                UI_AbrirModalAgregarPunto();
            }
        });
    } else {
        console.error("No se encontró el botón de agregar punto");
    }
}

// Función para ajustar la altura del formulario (exactamente 3 campos visibles)
function ajustarAlturaFormularioAgregar() {
    const formulario = document.getElementById('formulario-dispositivo-dinamico');
    if (!formulario) return;
    
    // Restablecer altura para obtener medidas correctas
    formulario.style.maxHeight = '';
    formulario.style.height = 'auto';
    
    setTimeout(() => {
        const grupos = formulario.querySelectorAll('.input-group');
        
        if (grupos.length === 0) {
            return;
        }
        
        // Calcular altura de un grupo
        const primerGrupo = grupos[0];
        const alturaGrupo = primerGrupo.getBoundingClientRect().height;
        const gap = 18; // gap entre grupos
        const paddingTop = 8; // padding superior del contenedor
        
        // Número de elementos a mostrar (máximo 3)
        const elementosAMostrar = Math.min(3, grupos.length);
        
        // Altura total = paddingTop + (n * alturaGrupo) + ((n-1) * gap)
        const alturaTotal = paddingTop + (elementosAMostrar * alturaGrupo) + ((elementosAMostrar - 1) * gap);
        
        // Aplicar la altura exacta
        formulario.style.maxHeight = alturaTotal + 'px';
        formulario.style.height = alturaTotal + 'px';
        
        // Detectar si hay scroll después de aplicar la altura
        setTimeout(() => {
            ajustarPaddingSegunScroll();
        }, 20);
    }, 50);
}

// Función para ajustar el padding derecho según si hay scroll
function ajustarPaddingSegunScroll() {
    const formulario = document.getElementById('formulario-dispositivo-dinamico');
    if (!formulario) return;
    
    void formulario.offsetHeight;
    
    const grupos = formulario.querySelectorAll('.input-group');
    const tieneScroll = formulario.scrollHeight > formulario.clientHeight + 5;
    
    grupos.forEach(grupo => {
        if (tieneScroll) {
            grupo.style.paddingRight = '25px';  // Espacio entre input y scrollbar
        } else {
            grupo.style.paddingRight = '10px';  // Espacio normal
        }
    });
}

// Función para agregar un punto al mapa (con o sin efecto de ondas)
function UI_AgregarPuntoAlMapa(dispositivo, conEfecto = true) {
    const devicesLayer = document.getElementById('devices-layer');
    if (!devicesLayer) {
        console.error("❌ No se encontró devices-layer");
        return;
    }
    
    const cleanId = dispositivo.id.replace(/:/g, '');
    
    const existingPoint = document.getElementById(`dev-${cleanId}`);
    if (existingPoint) {
        console.log(`⚠️ El punto ${dispositivo.id} ya existe, no se duplica`);
        return;
    }
    
    let x = dispositivo.x;
    let y = dispositivo.y;
    
    if (typeof x === 'number') {
        x = x + 'px';
    }
    if (typeof x === 'string' && !x.includes('%') && !x.includes('px')) {
        x = x + 'px';
    }
    if (typeof y === 'number') {
        y = y + 'px';
    }
    if (typeof y === 'string' && !y.includes('%') && !y.includes('px')) {
        y = y + 'px';
    }
    
    console.log(`📍 Agregando punto ${dispositivo.id} en (${x}, ${y})`);
    
    const markerWrapper = document.createElement('div');
    markerWrapper.className = 'marker-wrapper';
    markerWrapper.id = `dev-${cleanId}`;
    markerWrapper.style.position = 'absolute';
    markerWrapper.style.top = y;
    markerWrapper.style.left = x;
    markerWrapper.style.transform = 'translate(-50%, -50%)';
    markerWrapper.style.zIndex = '10';
    markerWrapper.style.cursor = 'move';
    markerWrapper.style.padding = '10px';
    
    const puntoColor = conEfecto ? '#4ade80' : '#38bdf8';
    const clasePunto = conEfecto ? 'punto nuevo-punto' : 'punto';
    
    const ondasHTML = conEfecto ? `
        <div class="onda onda1"></div>
        <div class="onda onda2"></div>
        <div class="onda onda3"></div>
    ` : '';
    
    const detallesHTML = Object.entries(dispositivo.detalles).map(([key, value]) => `
        <div class="label">${escapeHtml(key)}</div>
        <div class="data no-edit">${escapeHtml(value)}</div>
    `).join('');
    
    markerWrapper.innerHTML = `
        <div class="${clasePunto}" style="background: ${puntoColor}; box-shadow: 0 0 15px ${puntoColor};">
            ${ondasHTML}
        </div>
        <div class="info-box" data-mac="${dispositivo.id}">
            <div class="status-row">
                <div style="display:flex; align-items:center; gap:6px;">
                    <span class="label-header">${escapeHtml(dispositivo.id)}</span>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span class="online-status" style="color: ${puntoColor};">● ${conEfecto ? 'NUEVO' : 'ACTIVO'}</span>
                </div>
            </div>
            <div class="scroll-content">
                ${detallesHTML}
            </div>
        </div>
    `;
    
    devicesLayer.appendChild(markerWrapper);
    console.log(`✅ Punto ${dispositivo.id} agregado correctamente`);
    
    if (conEfecto) {
        markerWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
            const ondas = markerWrapper.querySelectorAll('.onda');
            ondas.forEach(onda => {
                onda.style.animation = 'none';
                onda.remove();
            });
            const punto = markerWrapper.querySelector('.punto');
            if (punto) {
                punto.classList.remove('nuevo-punto');
            }
        }, 5000);
    }
}