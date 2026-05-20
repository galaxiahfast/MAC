


import { ApartadosAPI } from './comunicacionHTTP.js';
import { setApartados } from './memoriaCache.js';



// @galaxiahfast - Sincroniza estado completo desde backend.
export async function sincronizarApartados() {

    // @galaxiahfast - Consulta el catálogo al servidor y actualiza la caché si la respuesta es exitosa.
    const res = await ApartadosAPI.listar();
    if (res.estado !== 'exito') return;
    setApartados(res.apartados);
}



// @galaxiahfast - Crea apartado y refresca estado.
export async function crearApartado(nombre, valor) {

    // @galaxiahfast - Transmite los datos de registro y dispara la resincronización local de la caché.
    const res = await ApartadosAPI.crear({
        nombreApartado: nombre,
        valorPredeterminado: valor
    });
    if (res.estado !== 'exito') {
        throw new Error(res.mensaje || 'Error al crear');
    }
    await sincronizarApartados();
}



// @galaxiahfast - Envía a papelera.
export async function eliminarApartado(nombre) {

    // @galaxiahfast - Solicita la baja lógica al servidor y actualiza el estado si se procesa correctamente.
    const res = await ApartadosAPI.eliminar(nombre);
    if (res.estado !== 'exito') {
        throw new Error(res.mensaje || 'Error al eliminar');
    }
    await sincronizarApartados();
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


