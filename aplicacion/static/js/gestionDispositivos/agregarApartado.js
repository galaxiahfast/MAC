/* @galaxiahfast - Módulo encargado de gestionar la lógica de creación de nuevos apartados globales. */
import { crearApartado } from '../infraestructura/sincronizarApartados.js';

/* ==========================================================================
   @galaxiahfast - LÓGICA DE PROCESAMIENTO DE FORMULARIOS
   ========================================================================== */

/* @galaxiahfast - Maneja el envío del formulario de registro de nuevo apartado global. */
async function manejarSubmitRegistroApartado(event) {
    event.preventDefault();
    const nombreApartado = document.getElementById('inputEspecificoNombreNuevoApartado').value.trim();
    const valorPredeterminado = document.getElementById('inputEspecificoValorPredeterminadoNuevoApartado').value.trim();
    if (!nombreApartado) return;
    event.target.reset();
    establecerValoresPredeterminadosCampos();
    await crearApartado(nombreApartado, valorPredeterminado);
}

/* @galaxiahfast - Establece valores predeterminados y placeholders. */
function establecerValoresPredeterminadosCampos() {
    const inputNombre = document.getElementById('inputEspecificoNombreNuevoApartado');
    const inputValor = document.getElementById('inputEspecificoValorPredeterminadoNuevoApartado');
    if (inputNombre) inputNombre.placeholder = "Nuevo_Apartado";
    if (inputValor) inputValor.placeholder = "Por_Defecto";
}

/* @galaxiahfast - Limpia los campos y oculta el panel, removiendo la clase de control de clic. */
export function limpiarYRestaurarFormulario() {
    const formulario = document.getElementById('formularioRegistroApartadoGlobal');
    const contenedor = document.getElementById('contenedorFlotanteRegistroApartadoGlobal');
    if (contenedor) {
        contenedor.classList.add('estado-panel-oculto');
        contenedor.classList.remove('panel-formulario-activo'); // Remueve control de clic
    }
    if (formulario) formulario.reset();
    establecerValoresPredeterminadosCampos();
}

/* ==========================================================================
   @galaxiahfast - CONTROLADORES PARA EL MENÚ PRINCIPAL
   ========================================================================== */

/* @galaxiahfast - Abre el panel y añade la clase para proteger el clic. */
export function abrirPanelRegistro() {
    const contenedor = document.getElementById('contenedorFlotanteRegistroApartadoGlobal');
    if (contenedor) {
        contenedor.classList.remove('estado-panel-oculto');
        contenedor.classList.add('panel-formulario-activo');
    }
}

/* @galaxiahfast - Inicialización del módulo. */
export function inicializarModuloRegistro() {
    const formularioRegistro = document.getElementById('formularioRegistroApartadoGlobal');
    const contenedorFlotante = document.getElementById('contenedorFlotanteRegistroApartadoGlobal');
    establecerValoresPredeterminadosCampos();
    if (formularioRegistro) {
        formularioRegistro.addEventListener('submit', manejarSubmitRegistroApartado);
    }
}