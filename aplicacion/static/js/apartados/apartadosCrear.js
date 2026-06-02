import { crearApartado } from './sincronizarApartados.js';
let botonAlternarPanel = null;
// @galaxiahfast - Maneja el envío directo del formulario de registro de apartados globales.
async function manejarSubmitRegistroApartado(event) {
    event.preventDefault();
    const botonSubmit = event.target.querySelector('.boton-accion-confirmar-registro-apartado');
    const nombreApartado = document.getElementById('inputEspecificoNombreNuevoApartado').value.trim();
    const valorPredeterminado = document.getElementById('inputEspecificoValorPredeterminadoNuevoApartado').value.trim();
    if (!nombreApartado) return;
    botonSubmit.disabled = true;
    botonSubmit.textContent = "Procesando...";
    try {
        await crearApartado(nombreApartado, valorPredeterminado);
        event.target.reset();
        establecerValoresPredeterminadosCampos();
    } catch (error) {
        console.error("Fallo en la persistencia del apartado:", error);
        alert(error.message);
    } finally {
        botonSubmit.disabled = false;
        botonSubmit.textContent = "Guardar Apartado";
    }
}
// @galaxiahfast - Asigna valores iniciales estandarizados como texto fantasma (placeholder) en la UI.
function establecerValoresPredeterminadosCampos() {
    const inputNombre = document.getElementById('inputEspecificoNombreNuevoApartado');
    const inputValor = document.getElementById('inputEspecificoValorPredeterminadoNuevoApartado');
    if (inputNombre) inputNombre.placeholder = "Nuevo_Apartado";
    if (inputValor) inputValor.placeholder = "Por_Defecto";
}
// @galaxiahfast - Limpia los campos de texto escritos y reestablece el estado inicial del formulario.
function limpiarYRestaurarFormulario(formulario, contenedor) {
    if (contenedor) contenedor.classList.add('estado-panel-oculto');
    if (formulario) formulario.reset();
    establecerValoresPredeterminadosCampos();
}
// @galaxiahfast - Inicializa los escuchadores de eventos para el ciclo de vida del componente.
document.addEventListener('DOMContentLoaded', () => {
    const formularioRegistro = document.getElementById('formularioRegistroApartadoGlobal');
    const contenedorFlotante = document.getElementById('contenedorFlotanteRegistroApartadoGlobal');
    botonAlternarPanel = document.getElementById('botonRegistrarNuevoApartadoGlobalDispositivos');
    establecerValoresPredeterminadosCampos();
    if (formularioRegistro) {
        formularioRegistro.addEventListener('submit', manejarSubmitRegistroApartado);
    }
    if (botonAlternarPanel && contenedorFlotante) {
        botonAlternarPanel.addEventListener('click', () => {
            const estaOculto = contenedorFlotante.classList.contains('estado-panel-oculto');
            if (estaOculto) {
                contenedorFlotante.classList.remove('estado-panel-oculto');
            } else {
                limpiarYRestaurarFormulario(formularioRegistro, contenedorFlotante);
            }
        });
    }
    // PROTECCIÓN OPERATIVA: Evita que el menú deseleccione el botón al interactuar con los inputs
    if (contenedorFlotante) {
        contenedorFlotante.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    // INTERCEPCIÓN GLOBAL DE CLICS PARA CIERRE, RESETEO Y DESACTIVACIÓN DE BOTÓN MENÚ
    document.addEventListener('click', (event) => {
        if (!contenedorFlotante || contenedorFlotante.classList.contains('estado-panel-oculto')) return;
        const clickDentroDelFormulario = contenedorFlotante.contains(event.target);
        const clickEnBotonDisparador = botonAlternarPanel && botonAlternarPanel.contains(event.target);
        const clickEnBotonTema = event.target.closest('#botonAlternarTemaVisualAplicacion');
        if (!clickDentroDelFormulario && !clickEnBotonDisparador && !clickEnBotonTema) {
            limpiarYRestaurarFormulario(formularioRegistro, contenedorFlotante);
            if (botonAlternarPanel) {
                botonAlternarPanel.classList.remove('activo');
            }
        }
    });
});