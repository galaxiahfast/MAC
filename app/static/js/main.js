/* ==========================================================================
   INICIALIZACIÓN Y CONFIGURACIÓN GLOBAL
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    /* ⚡ Inicializar tema (ahora en su propio archivo) */
    iniciarControlTema();

    /* Inicializar manejadores */
    initApartadosManager();           // Desde gestionApartados.js
    initGlobalToolEvents();           // Local
    initEliminarApartadosManager();   // Desde gestionApartados.js
    initAgregarPuntoManager();        // Desde gestionDispositivos.js
    
    /* Precargar datos en segundo plano */
    setTimeout(() => {
        cargarApartados();            // Desde precargaDatos.js
    }, 100);
        
    /* Cargar dispositivos existentes */
    CargarTodosLosDispositivos();     // Desde gestionDispositivos.js
});

/* ==========================================================================
   FUNCIONES DE UTILIDAD Y RESETEO (GLOBALES)
   ========================================================================== */

function initGlobalToolEvents() {
    const allButtons = document.querySelectorAll('.tool-btn');
    allButtons.forEach(btn => {
        if (btn.id === 'theme-toggle' || btn.id === 'btn-config' || btn.id === 'btn-delete-params') return;
        btn.addEventListener('click', () => UI_CerrarTodosLosModales());
    });
}