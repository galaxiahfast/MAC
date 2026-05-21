


import { crearApartado } from './sincronizarApartados.js';



// @galaxiahfast - Maneja envío del formulario de creación.
async function manejarSubmit(event) {

    // @galaxiahfast - Evita recarga nativa, extrae las variables sanitizadas y valida el campo obligatorio.
    event.preventDefault();
    const nombre = document.getElementById('inputNombreApartado').value.trim();
    const valor = document.getElementById('inputValorPredeterminado').value.trim();
    if (!nombre) return;

    // @galaxiahfast - Ejecuta creación y resetea formulario si el proceso finaliza correctamente.
    try {
        await crearApartado(nombre, valor);
        event.target.reset();
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}



// @galaxiahfast - Inicializa el formulario de creación.
document.addEventListener('DOMContentLoaded', () => {

    // @galaxiahfast - Recupera el elemento del DOM y vincula el escuchador para el evento submit.
    const formulario = document.getElementById('formularioCrearApartado');
    if (!formulario) return;
    formulario.addEventListener('submit', manejarSubmit);
});


