/* ==========================================================================
   GESTIÓN DE DISPOSITIVOS (AGREGAR PUNTOS AL MAPA)
   ========================================================================== */

let datosDispositivoPendiente = null;
let isWaitingForDispositivoConfirmation = false;
let apartadosActivosFormulario = [];

/* ==========================================================================
   FUNCIONES PARA OBTENER APARTADOS ACTIVOS
   ========================================================================== */

async function ObtenerApartadosActivos(forzarRefresh = false) {
    if (!forzarRefresh && window.cacheAgregar) {
        apartadosActivosFormulario = window.cacheAgregar;
        console.log("📋 Apartados desde caché:", apartadosActivosFormulario);
        return apartadosActivosFormulario;
    }
    
    const apartados = await cargarApartados(forzarRefresh);
    apartadosActivosFormulario = apartados;
    window.cacheAgregar = [...apartados];
    return apartadosActivosFormulario;
}

/* ==========================================================================
   RENDERIZADO DEL FORMULARIO DINÁMICO
   ========================================================================== */

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
        
        // ID seguro para el input
        const idSeguro = limpiarParaId(apartado);
        
        grupo.innerHTML = `
            <span class="input-label caps-text">${manejoCaracteresEspeciales(apartado)}</span>
            <input type="text" id="campo_${idSeguro}" class="modern-input" placeholder="EJ: VALOR" style="text-transform: uppercase;">
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

/* ==========================================================================
   CICLO DE CONFIRMACIÓN Y GUARDADO
   ========================================================================== */

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

/* ==========================================================================
   RESETEO Y UTILIDADES DEL FORMULARIO
   ========================================================================== */

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

/* ==========================================================================
   INICIALIZACIÓN DEL BOTÓN DE AGREGAR PUNTO
   ========================================================================== */

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

/* ==========================================================================
   AJUSTES DE ALTURA Y PADDING DEL FORMULARIO
   ========================================================================== */

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

/* ==========================================================================
   FUNCIONES DEL MAPA (PUNTOS)
   ========================================================================== */

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
        <div class="label">${manejoCaracteresEspeciales(key)}</div>
        <div class="data no-edit">${manejoCaracteresEspeciales(value)}</div>
    `).join('');
    
    markerWrapper.innerHTML = `
        <div class="${clasePunto}" style="background: ${puntoColor}; box-shadow: 0 0 15px ${puntoColor};">
            ${ondasHTML}
        </div>
        <div class="info-box" data-mac="${dispositivo.id}">
            <div class="status-row">
                <div style="display:flex; align-items:center; gap:6px;">
                    <span class="label-header">${manejoCaracteresEspeciales(dispositivo.id)}</span>
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

// Función auxiliar para limpiar IDs
function limpiarParaId(texto) {
    return texto.replace(/[^a-zA-Z0-9]/g, '_');
}

/* ==========================================================================
   CARGA DE DISPOSITIVOS EXISTENTES EN EL MAPA
   ========================================================================== */

async function CargarTodosLosDispositivos() {
    try {
        const response = await fetch('/api/dispositivos/listar');
        const data = await response.json();
        
        console.log("📡 Respuesta del servidor:", data);
        
        if (data.estado === 'exito') {  // ← Cambiado de 'status' a 'estado' y de 'success' a 'exito'
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
            console.error("❌ Error al cargar dispositivos:", data.message || data.mensaje);
        }
    } catch (error) {
        console.error("❌ Error cargando dispositivos:", error);
    }
}