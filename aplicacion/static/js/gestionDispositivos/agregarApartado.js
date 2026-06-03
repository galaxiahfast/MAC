/* @galaxiahfast - Módulo encargado de manejar la creación de nuevos apartados globales desde el panel flotante. */
import { crearApartado } from '../infraestructura/sincronizarApartados.js';
let botonAlternarPanel = null;

// @galaxiahfast - Manejo de submit 100% fluido y silencioso.
async function manejarSubmitRegistroApartado(event) {
    event.preventDefault();
    const nombreApartado = document.getElementById('inputEspecificoNombreNuevoApartado').value.trim();
    const valorPredeterminado = document.getElementById('inputEspecificoValorPredeterminadoNuevoApartado').value.trim();
    if (!nombreApartado) return;
    crearApartado(nombreApartado, valorPredeterminado);
    event.target.reset();
    establecerValoresPredeterminadosCampos();
}

// @galaxiahfast - Asigna placeholders iniciales.
function establecerValoresPredeterminadosCampos() {
    const inputNombre = document.getElementById('inputEspecificoNombreNuevoApartado');
    const inputValor = document.getElementById('inputEspecificoValorPredeterminadoNuevoApartado');
    if (inputNombre) inputNombre.placeholder = "Nuevo_Apartado";
    if (inputValor) inputValor.placeholder = "Por_Defecto";
}

// @galaxiahfast - Limpia y oculta el formulario.
function limpiarYRestaurarFormulario(formulario, contenedor) {
    if (contenedor) contenedor.classList.add('estado-panel-oculto');
    if (formulario) formulario.reset();
    establecerValoresPredeterminadosCampos();
}

// @galaxiahfast - Inicializa los eventos del DOM.
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
    if (contenedorFlotante) {
        contenedorFlotante.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
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