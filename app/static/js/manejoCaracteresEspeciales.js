


/* ==========================================================================
   @galaxiahfast MANEJO DE CARACTERES ESPECIALES
   ========================================================================== */

/**
 * @galaxiahfast Convierte caracteres especiales HTML en texto seguro.
 *
 * Previene inyecciones HTML y posibles ataques XSS
 * al transformar caracteres especiales en entidades HTML.
 *
 * @param {string} texto - Texto que será procesado.
 * @returns {string} Texto seguro para mostrar en HTML.
 */
function manejoCaracteresEspeciales(texto) {

    /* @galaxiahfast Validar contenido */
    if (!texto) {
        return '';
    }

    /* @galaxiahfast Crear contenedor temporal */
    const div = document.createElement('div');

    /* @galaxiahfast Convertir texto seguro */
    div.textContent = texto;

    return div.innerHTML;
}

/**
 * @galaxiahfast Escapa comillas simples y dobles.
 *
 * Permite utilizar texto dinámico dentro de atributos
 * HTML como onclick sin romper la sintaxis.
 *
 * @param {string} texto - Texto que será procesado.
 * @returns {string} Texto seguro para atributos HTML.
 */
function escaparComillas(texto) {

    /* @galaxiahfast Validar contenido */
    if (!texto) {
        return '';
    }

    /* @galaxiahfast Reemplazar comillas peligrosas */
    return texto
        .replace(/'/g, "\\'")
        .replace(/"/g, '&quot;');
}

/**
 * @galaxiahfast Limpia texto para usarlo como identificador HTML.
 *
 * Elimina acentos y caracteres especiales, reemplazando
 * espacios o símbolos por guiones bajos.
 *
 * @param {string} texto - Texto que será procesado.
 * @returns {string} Texto seguro para usar como ID.
 */
function limpiarParaId(texto) {

    /* @galaxiahfast Validar contenido */
    if (!texto) {
        return '';
    }

    /* @galaxiahfast Normalizar identificador */
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .toUpperCase();
}


