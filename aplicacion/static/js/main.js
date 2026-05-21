


import { sincronizarApartados } from './apartados/sincronizarApartados.js';
import './apartados/apartadosCrear.js';
import './apartados/apartadosLista.js';
import './apartados/apartadosPapelera.js';
import './apartados/apartadosSecciones.js';



// @galaxiahfast - Punto central de inicialización de módulos.
document.addEventListener('DOMContentLoaded', async () => {

    // @galaxiahfast - Sincroniza el catálogo inicial desde backend antes de renderizar interfaces.
    await sincronizarApartados();
});


