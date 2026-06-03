/* @galaxiahfast - Lógica de negocio y sincronización de apartados globales. */
import { ApartadosAPI } from './comunicacionHTTP.js';
import { setApartados, getApartados, actualizarApartadosOptimista } from './memoriaCache.js';

/* @galaxiahfast - Sincroniza la colección de apartados desde el servidor y actualiza la memoria local. */
export async function sincronizarApartados() {
    const res = await ApartadosAPI.listar();
    if (res.estado !== 'exito') return;
    setApartados(res.apartados);
}

/* @galaxiahfast - Crea un nuevo apartado global con manejo optimista y rollback en caso de error. */
export async function crearApartado(nombre, valor) {
    const nuevoApartado = { nombre, valor };
    const respaldo = [...getApartados()];
    actualizarApartadosOptimista(nuevoApartado);
    try {
        const res = await ApartadosAPI.crear({
            nombreApartado: nombre,
            valorPredeterminado: valor
        });
        if (res.estado !== 'exito') throw new Error(res.mensaje);
    } catch (error) {
        setApartados(respaldo);
        alert('No se pudo guardar: ' + error.message);
    }
}

/* @galaxiahfast - Elimina un apartado global con manejo optimista y rollback en caso de error. */
export async function eliminarApartado(nombre) {
    const respaldo = [...getApartados()];
    eliminarApartadoOptimista(nombre);
    try {
        const res = await ApartadosAPI.eliminar(nombre);
        if (res.estado !== 'exito') throw new Error('Error al eliminar en servidor');
    } catch (error) {
        setApartados(respaldo);
        alert('No se pudo eliminar: ' + error.message);
    }
}











// @galaxiahfast - Restauración lógica.
export async function restaurarApartado(nombre) {

    // @galaxiahfast - Solicita reactivar el registro de la papelera y refresca la memoria local.
    const res = await ApartadosAPI.restaurar(nombre);
    if (res.estado !== 'exito') {
        throw new Error(res.mensaje || 'Error al restaurar');
    }
    await sincronizarApartados();
}



// @galaxiahfast - Eliminación definitiva.
export async function eliminarApartadoDefinitivo(nombre) {

    // @galaxiahfast - Dispara la purga irreversible en el servidor y sincroniza la interfaz de usuario.
    const res = await ApartadosAPI.eliminarDefinitivo(nombre);
    if (res.estado !== 'exito') {
        throw new Error(res.mensaje || 'Error al eliminar definitivo');
    }
    await sincronizarApartados();
}


