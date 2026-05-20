


// @galaxiahfast - Estado central de apartados en memoria.
const estado = {
    apartados: [],
    suscriptores: []
};



// @galaxiahfast - Actualiza el estado global.
export function setApartados(nuevos) {

    // @galaxiahfast - Asigna la nueva colección y dispara la alerta a los observadores.
    estado.apartados = nuevos;
    notificar();
}



// @galaxiahfast - Obtiene snapshot del estado.
export function getApartados() {

    // @galaxiahfast - Retorna la lista actual almacenada en la memoria caché local.
    return estado.apartados;
}



// @galaxiahfast - Suscripción simple tipo observer.
export function suscribirse(callback) {

    // @galaxiahfast - Añade una función callback a la lista de ejecución reactiva.
    estado.suscriptores.push(callback);
}



// @galaxiahfast - Notifica cambios a UI.
function notificar() {

    // @galaxiahfast - Itera y ejecuta cada callback pasando el estado actualizado.
    estado.suscriptores.forEach(fn => fn(estado.apartados));
}


