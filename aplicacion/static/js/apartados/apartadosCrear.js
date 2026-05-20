


import { crearApartado } from '../core/sincronizarApartados.js';
import { suscribirse } from '../core/memoriaCache.js';



// @galaxiahfast - Maneja envío del formulario de creación.
async function manejarSubmit(event) {

    // @galaxiahfast - Evita la recarga nativa, extrae los valores y valida el campo obligatorio.
    event.preventDefault();
    const nombre = document.getElementById('inputNombreApartado').value;
    const valor = document.getElementById('inputValorPredeterminado').value;
    if (!nombre) return;

    // @galaxiahfast - Intenta crear el apartado y maneja errores mostrando alertas.
    try {
        await crearApartado(nombre, valor);
        event.target.reset();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}



// @galaxiahfast - Inicializa el formulario.
document.addEventListener('DOMContentLoaded', () => {

    // @galaxiahfast - Recupera el elemento del DOM y vincula el escuchador para el evento submit.
    const form = document.getElementById('formApartado');
    if (form) {
        form.addEventListener('submit', manejarSubmit);
    }
});


