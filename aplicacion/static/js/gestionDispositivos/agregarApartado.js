import { crearApartado } from '../infraestructura/sincronizarApartados.js';
let botonAlternarPanel = null;

async function manejarSubmitRegistroApartado(event) {
    event.preventDefault();
    const nombreApartado = document.getElementById('inputEspecificoNombreNuevoApartado').value.trim();
    const valorPredeterminado = document.getElementById('inputEspecificoValorPredeterminadoNuevoApartado').value.trim();
    if (!nombreApartado) return;
    crearApartado(nombreApartado, valorPredeterminado);
    event.target.reset();
    establecerValoresPredeterminadosCampos();
}

function establecerValoresPredeterminadosCampos() {
    const inputNombre = document.getElementById('inputEspecificoNombreNuevoApartado');
    const inputValor = document.getElementById('inputEspecificoValorPredeterminadoNuevoApartado');
    if (inputNombre) inputNombre.placeholder = "Nuevo_Apartado";
    if (inputValor) inputValor.placeholder = "Por_Defecto";
}

function limpiarYRestaurarFormulario(formulario, contenedor) {
    if (contenedor) contenedor.classList.add('estado-panel-oculto');
    if (formulario) formulario.reset();
    establecerValoresPredeterminadosCampos();
}

document.addEventListener('DOMContentLoaded', () => {
    const formularioRegistro = document.getElementById('formularioRegistroApartadoGlobal');
    const contenedorFlotante = document.getElementById('contenedorFlotanteRegistroApartadoGlobal');
    const panelHermano = document.getElementById('contenedorFlotanteGestionApartado'); // Referencia al otro panel
    botonAlternarPanel = document.getElementById('botonRegistrarNuevoApartadoGlobalDispositivos');
    
    establecerValoresPredeterminadosCampos();

    if (formularioRegistro) formularioRegistro.addEventListener('submit', manejarSubmitRegistroApartado);

    if (botonAlternarPanel && contenedorFlotante) {
        botonAlternarPanel.addEventListener('click', (e) => {
            e.stopPropagation();
            // Cierra el hermano si está abierto
            if (panelHermano) {
                panelHermano.classList.add('estado-panel-oculto');
                const btnHermano = document.getElementById('botonEliminarApartadosExistentesDispositivos');
                if (btnHermano) btnHermano.classList.remove('activo');
            }
            
            const estaOculto = contenedorFlotante.classList.contains('estado-panel-oculto');
            if (estaOculto) {
                contenedorFlotante.classList.remove('estado-panel-oculto');
                botonAlternarPanel.classList.add('activo');
            } else {
                limpiarYRestaurarFormulario(formularioRegistro, contenedorFlotante);
                botonAlternarPanel.classList.remove('activo');
            }
        });
    }

    if (contenedorFlotante) contenedorFlotante.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('click', (event) => {
        if (!contenedorFlotante || contenedorFlotante.classList.contains('estado-panel-oculto')) return;
        const clickDentro = contenedorFlotante.contains(event.target);
        const clickBoton = botonAlternarPanel && botonAlternarPanel.contains(event.target);
        if (!clickDentro && !clickBoton) {
            limpiarYRestaurarFormulario(formularioRegistro, contenedorFlotante);
            if (botonAlternarPanel) botonAlternarPanel.classList.remove('activo');
        }
    });
});