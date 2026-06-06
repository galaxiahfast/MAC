/* @galaxiahfast - Módulo de memoria caché para dispositivos del mapa, implementando un patrón de suscripción para mantener la UI sincronizada. */
const estado = { dispositivos: [], suscriptores: [] };



/* @galaxiahfast - Devuelve la colección actual de dispositivos almacenada en memoria. */
export function getDispositivos() {
    return estado.dispositivos;
}



/* @galaxiahfast - Reemplaza completamente la colección de dispositivos en memoria y notifica a los suscriptores para refrescar la UI. */
export function setDispositivos(nuevos) {
    estado.dispositivos = nuevos;
    notificar();
}



/* @galaxiahfast - Registra un callback para recibir notificaciones cuando los dispositivos cambien. */
export function suscribirseDispositivos(callback) {
    estado.suscriptores.push(callback);
}



/* @galaxiahfast - Notifica a todos los suscriptores registrados con la colección actualizada. */
function notificar() {
    estado.suscriptores.forEach(fn => fn(estado.dispositivos));
}
