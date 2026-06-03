/* @galaxiahfast - Módulo principal de JavaScript que actúa como punto central de inicialización y coordinación de funcionalidades relacionadas con apartados globales. */
import { sincronizarApartados } from './infraestructura/sincronizarApartados.js';
import './gestionDispositivos/agregarApartado.js';
import './gestionDispositivos/gestionApartado.js';

/* @galaxiahfast - Al cargar el DOM, se sincronizan los apartados globales desde el servidor para asegurar que la interfaz refleje el estado actual de la base de datos. */
document.addEventListener('DOMContentLoaded', async () => {
    await sincronizarApartados();
});