/* @galaxiahfast - Módulo de memoria caché para apartados globales, implementando un patrón de suscripción para mantener la UI sincronizada. */
const estado = { apartados: [], suscriptores: [] };

/* @galaxiahfast - Devuelve la colección actual de apartados almacenada en memoria. */
export function getApartados() {
    return estado.apartados;
}

/* @galaxiahfast - Actualiza la colección de apartados en memoria y notifica a los suscriptores para refrescar la UI. */
export function actualizarApartadosOptimista(nuevoApartado) {
    estado.apartados = [...estado.apartados, nuevoApartado];
    notificar();
}

/* @galaxiahfast - Reemplaza completamente la colección de apartados en memoria, generalmente después de una sincronización con el servidor. */
export function setApartados(nuevos) {
    estado.apartados = nuevos;
    notificar();
}















export function suscribirse(callback) {
    estado.suscriptores.push(callback);
}
function notificar() {
    estado.suscriptores.forEach(fn => fn(estado.apartados));
}
/* @galaxiahfast - Elimina un apartado de la caché local de forma optimista filtrando por nombreApartado. */
export function eliminarApartadoOptimista(nombre) {
    estado.apartados = estado.apartados.filter(a => a.nombreApartado !== nombre);
    notificar();
}