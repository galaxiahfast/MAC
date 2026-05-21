


// @galaxiahfast - Inicializa navegación contextual del modal de apartados.
document.addEventListener('DOMContentLoaded', () => {

    // @galaxiahfast - Recupera referencias directas de los botones laterales del DOM.
    const botonAgregar = document.getElementById('botonAbrirAgregarApartados');
    const botonEliminar = document.getElementById('botonAbrirEliminarApartados');
    const botonPapelera = document.getElementById('botonAbrirPapeleraApartados');

    // @galaxiahfast - Recupera referencias del modal contenedor y de los paneles de vista internos.
    const modal = document.getElementById('contenedorModalConfiguracionApartados');
    const panelAgregar = document.getElementById('contenedorAgregarApartados');
    const panelEliminar = document.getElementById('contenedorEliminarApartados');
    const panelPapelera = document.getElementById('contenedorPapeleraApartados');

    // @galaxiahfast - Valida la existencia estructural mínima requerida para los controles e interfaces.
    if (!botonAgregar || !botonEliminar || !botonPapelera || !modal || !panelAgregar || !panelEliminar || !panelPapelera) {
        return;
    }

    // @galaxiahfast - Mantiene el estado persistente en memoria de la vista activa actualmente.
    let panelActivo = null;

    // @galaxiahfast - Oculta de forma masiva todos los paneles internos modificando su propiedad display.
    function ocultarPaneles() {
        panelAgregar.style.display = 'none';
        panelEliminar.style.display = 'none';
        panelPapelera.style.display = 'none';
    }

    // @galaxiahfast - Centraliza el control de apertura, reseteo y alternancia selectiva de paneles.
    function abrirPanel(tipo) {

        // @galaxiahfast - Cierra completamente la interfaz si se vuelve a clickear el panel que ya está visible.
        if (modal.style.display === 'flex' && panelActivo === tipo) {
            modal.style.display = 'none';
            ocultarPaneles();
            panelActivo = null;
            return;
        }

        // @galaxiahfast - Despliega el modal maestro y limpia todas las subtareas visuales anteriores.
        modal.style.display = 'flex';
        ocultarPaneles();

        if (tipo === 'agregar') {
            panelAgregar.style.display = 'block';
        }
        if (tipo === 'eliminar') {
            panelEliminar.style.display = 'block';
        }
        if (tipo === 'papelera') {
            panelPapelera.style.display = 'block';
        }

        panelActivo = tipo;
    }

    // @galaxiahfast - Vincula los escuchadores de eventos para la navegación de creación, eliminación y papelera.
    botonAgregar.addEventListener('click', () => {
        abrirPanel('agregar');
    });
    botonEliminar.addEventListener('click', () => {
        abrirPanel('eliminar');
    });
    botonPapelera.addEventListener('click', () => {
        abrirPanel('papelera');
    });

    // @galaxiahfast - Permite cerrar el modal y limpiar el estado de la UI al presionar directamente sobre el overlay externo.
    modal.addEventListener('click', (evento) => {
        if (evento.target !== modal) return;
        modal.style.display = 'none';
        ocultarPaneles();
        panelActivo = null;
    });
});


