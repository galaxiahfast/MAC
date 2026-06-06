/* @galaxiahfast - Módulo principal de JavaScript que actúa como punto central de inicialización y coordinación de funcionalidades relacionadas con apartados globales y dispositivos. */
import { sincronizarApartados } from './infraestructura/sincronizarApartados.js';
import { sincronizarDispositivos } from './infraestructura/sincronizarDispositivos.js';
import './gestionDispositivos/agregarApartado.js';
import './gestionDispositivos/gestionApartados.js';

/* @galaxiahfast - Al cargar el DOM, se sincronizan los apartados y dispositivos desde el servidor para asegurar que la interfaz refleje el estado actual de la base de datos. */
document.addEventListener('DOMContentLoaded', async () => {
    await sincronizarApartados();
    await sincronizarDispositivos();
    window.dispatchEvent(new CustomEvent('app:datos-listos'));
});
