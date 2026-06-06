/* @galaxiahfast - Lógica de negocio y sincronización de dispositivos del mapa. */
import { DispositivosAPI } from './comunicacionHTTP.js';
import { setDispositivos, getDispositivos } from './memoriaCacheDispositivos.js';



/* @galaxiahfast - Sincroniza la colección de dispositivos desde el servidor y actualiza la memoria local. */
export async function sincronizarDispositivos() {
    const res = await DispositivosAPI.listar();
    if (res.estado !== 'exito') return;
    setDispositivos(res.dispositivos);
}



/* @galaxiahfast - Crea un nuevo dispositivo en el mapa con actualización optimista y rollback. */
export async function crearDispositivoEnMapa(posicionX, posicionY) {
    const respaldo = [...getDispositivos()];

    // @galaxiahfast - Añade un placeholder temporal en la memoria para renderizado inmediato.
    const temporal = {
        id: Date.now(),
        posicionX,
        posicionY,
        estadoVisible: 1,
        detalles: [],
        temporal: true
    };
    setDispositivos([...respaldo, temporal]);

    try {
        const res = await DispositivosAPI.crear(posicionX, posicionY);
        if (res.estado !== 'exito') throw new Error(res.mensaje);

        // @galaxiahfast - Resincroniza para obtener el ID real y los detalles generados.
        await sincronizarDispositivos();
    } catch (error) {
        setDispositivos(respaldo);
        alert('No se pudo crear el dispositivo: ' + error.message);
    }
}



/* @galaxiahfast - Mueve un dispositivo existente actualizando sus coordenadas con manejo optimista. */
export async function moverDispositivoEnMapa(idDispositivo, posicionX, posicionY) {
    const respaldo = [...getDispositivos()];

    // @galaxiahfast - Actualiza la posición en memoria de forma optimista.
    setDispositivos(getDispositivos().map(d =>
        d.id === idDispositivo ? { ...d, posicionX, posicionY } : d
    ));

    try {
        const res = await DispositivosAPI.mover(idDispositivo, posicionX, posicionY);
        if (res.estado !== 'exito') throw new Error(res.mensaje);
    } catch (error) {
        setDispositivos(respaldo);
        alert('No se pudo mover el dispositivo: ' + error.message);
    }
}



/* @galaxiahfast - Elimina un dispositivo del mapa con manejo optimista y rollback. */
export async function eliminarDispositivoDelMapa(idDispositivo) {
    const respaldo = [...getDispositivos()];

    // @galaxiahfast - Remueve el dispositivo de la memoria de forma optimista.
    setDispositivos(getDispositivos().filter(d => d.id !== idDispositivo));

    try {
        const res = await DispositivosAPI.eliminar(idDispositivo);
        if (res.estado !== 'exito') throw new Error(res.mensaje);
    } catch (error) {
        setDispositivos(respaldo);
        alert('No se pudo eliminar el dispositivo: ' + error.message);
    }
}



/* @galaxiahfast - Alterna la visibilidad de un dispositivo con manejo optimista. */
export async function ocultarDispositivoEnMapa(idDispositivo) {
    const respaldo = [...getDispositivos()];

    // @galaxiahfast - Invierte el estado de visibilidad en memoria de forma optimista.
    setDispositivos(getDispositivos().map(d =>
        d.id === idDispositivo ? { ...d, estadoVisible: d.estadoVisible ? 0 : 1 } : d
    ));

    try {
        const res = await DispositivosAPI.ocultar(idDispositivo);
        if (res.estado !== 'exito') throw new Error(res.mensaje);
    } catch (error) {
        setDispositivos(respaldo);
        alert('No se pudo cambiar la visibilidad: ' + error.message);
    }
}
