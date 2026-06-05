/* @galaxiahfast - Lógica de negocio y sincronización de apartados globales. */
import { ApartadosAPI } from './comunicacionHTTP.js';
import { setApartados, getApartados, actualizarApartadosOptimista } from './memoriaCache.js';

/* @galaxiahfast - Sincroniza la colección de apartados desde el servidor y actualiza la memoria local. */
export async function sincronizarApartados() {
    const res = await ApartadosAPI.listar();
    if (res.estado !== 'exito') return;
    setApartados(res.apartados);
}

/* @galaxiahfast - Corrección en sincronizarApartados.js */
export async function crearApartado(nombre, valor) {
    // CORRECCIÓN: Estructura consistente con el servidor
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
        
        // OPCIONAL: Si el servidor devuelve el objeto completo (con ID y fecha), 
        // podrías hacer un 'setApartados' con la respuesta real para refrescar.
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






