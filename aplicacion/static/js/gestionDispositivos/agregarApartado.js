/* @galaxiahfast - Módulo encargado de gestionar la lógica de creación de nuevos apartados globales. */
import { crearApartado } from '../infraestructura/sincronizarApartados.js';

/* ==========================================================================
   @galaxiahfast - LÓGICA DE PROCESAMIENTO DE FORMULARIOS
   ========================================================================== */

/* @galaxiahfast - Maneja el envío del formulario de registro de nuevo apartado global, realizando validaciones básicas y llamando a la función de creación con los datos ingresados. */
async function manejarSubmitRegistroApartado(event) {
    event.preventDefault();
    const nombreApartado = document.getElementById('inputEspecificoNombreNuevoApartado').value.trim();
    const valorPredeterminado = document.getElementById('inputEspecificoValorPredeterminadoNuevoApartado').value.trim();
    if (!nombreApartado) return;
    crearApartado(nombreApartado, valorPredeterminado);
    event.target.reset();
    establecerValoresPredeterminadosCampos();
}

/* @galaxiahfast - Establece valores predeterminados y placeholders en los campos del formulario para mejorar la experiencia de usuario. */
function establecerValoresPredeterminadosCampos() {
    const inputNombre = document.getElementById('inputEspecificoNombreNuevoApartado');
    const inputValor = document.getElementById('inputEspecificoValorPredeterminadoNuevoApartado');
    if (inputNombre) inputNombre.placeholder = "Nuevo_Apartado";
    if (inputValor) inputValor.placeholder = "Por_Defecto";
}

/* @galaxiahfast - Limpia los campos del formulario y oculta el panel de registro, dejando todo listo para un nuevo ingreso. */
export function limpiarYRestaurarFormulario() {
    const formulario = document.getElementById('formularioRegistroApartadoGlobal');
    const contenedor = document.getElementById('contenedorFlotanteRegistroApartadoGlobal');
    if (contenedor) contenedor.classList.add('estado-panel-oculto');
    if (formulario) formulario.reset();
    establecerValoresPredeterminadosCampos();
}

/* ==========================================================================
   @galaxiahfast - CONTROLADORES PARA EL MENÚ PRINCIPAL
   ========================================================================== */

/* @galaxiahfast - Función pública para abrir el panel desde el controlador central */
export function abrirPanelRegistro() {
    const contenedor = document.getElementById('contenedorFlotanteRegistroApartadoGlobal');
    if (contenedor) contenedor.classList.remove('estado-panel-oculto');
}

/* @galaxiahfast - Inicialización mínima (solo enlaza el formulario, no el botón) */
export function inicializarModuloRegistro() {
    const formularioRegistro = document.getElementById('formularioRegistroApartadoGlobal');
    const contenedorFlotante = document.getElementById('contenedorFlotanteRegistroApartadoGlobal');
    
    establecerValoresPredeterminadosCampos();
    if (formularioRegistro) formularioRegistro.addEventListener('submit', manejarSubmitRegistroApartado);
    if (contenedorFlotante) contenedorFlotante.addEventListener('click', (e) => e.stopPropagation());
}