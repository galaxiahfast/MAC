/* @galaxiahfast - Lógica de negocio y sincronización de apartados globales. */
import { ApartadosAPI } from './comunicacionHTTP.js';
import { setApartados, getApartados, actualizarApartadosOptimista, eliminarApartadoOptimista } from './memoriaCache.js';
import { mostrarNotificacion } from '../otros/sistemaNotificaciones.js';

/* @galaxiahfast - Sincroniza la colección de apartados desde el servidor y actualiza la memoria local. */
export async function sincronizarApartados() {
    try {
        const res = await ApartadosAPI.listar();
        if (res.estado !== 'exito') return;
        setApartados(res.apartados);
    } catch (error) {
        console.error('@galaxiahfast - Error al sincronizar apartados:', error);
    }
}

/* @galaxiahfast - Crea un nuevo apartado global con actualización optimista y resincronización posterior. */
export async function crearApartado(nombre, valor) {
    if (!nombre || !nombre.trim()) {
        mostrarNotificacion('El nombre del apartado es obligatorio', 'error');
        return;
    }

    const nuevoApartado = {
        nombreApartado: nombre,
        valorPredeterminado: valor
    };

    const respaldo = [...getApartados()];
    actualizarApartadosOptimista(nuevoApartado);

    try {
        const res = await ApartadosAPI.crear({
            nombreApartado: nombre,
            valorPredeterminado: valor
        });
        if (res.estado !== 'exito') throw new Error(res.mensaje);

        /* @galaxiahfast - Resincroniza para obtener el ID real y la fecha de creación del servidor. */
        await sincronizarApartados();
        mostrarNotificacion('Apartado creado correctamente', 'exito');
    } catch (error) {
        setApartados(respaldo);
        mostrarNotificacion('No se pudo guardar: ' + error.message, 'error');
    }
}

/* @galaxiahfast - Elimina un apartado global con manejo optimista y rollback en caso de error. */
export async function eliminarApartado(nombre) {
    const respaldo = [...getApartados()];
    eliminarApartadoOptimista(nombre);

    try {
        const res = await ApartadosAPI.eliminar(nombre);
        if (res.estado !== 'exito') throw new Error(res.mensaje || 'Error al eliminar en servidor');
        mostrarNotificacion('Apartado eliminado correctamente', 'exito');
    } catch (error) {
        setApartados(respaldo);
        mostrarNotificacion('No se pudo eliminar: ' + error.message, 'error');
    }
}

/* @galaxiahfast - Edita un apartado global existente y resincroniza la caché tras el éxito. */
export async function editarApartadoGlobal(idApartado, nuevoNombre, nuevoValor) {
    if (!idApartado || !nuevoNombre || !nuevoNombre.trim()) {
        mostrarNotificacion('Datos incompletos para editar', 'error');
        return;
    }

    try {
        const res = await ApartadosAPI.editar(idApartado, nuevoNombre, nuevoValor);
        if (res.estado !== 'exito') throw new Error(res.mensaje || 'Error al editar');

        await sincronizarApartados();
        mostrarNotificacion('Apartado editado correctamente', 'exito');
    } catch (error) {
        mostrarNotificacion('No se pudo editar: ' + error.message, 'error');
    }
}
