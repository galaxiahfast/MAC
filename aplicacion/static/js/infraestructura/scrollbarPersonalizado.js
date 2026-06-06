/* @galaxiahfast - Utilidad reutilizable de scrollbar personalizado con soporte de arrastre. */

export function calcularGeometriaThumb(contenedor, alturaMinima = 40) {
    const { scrollHeight, clientHeight, scrollTop } = contenedor;
    const ratioVisible = clientHeight / scrollHeight;
    const thumbHeight = Math.max(ratioVisible * clientHeight, alturaMinima);
    const maxThumbTop = clientHeight - thumbHeight;
    const thumbTop = (scrollTop / (Math.max(scrollHeight - clientHeight, 1))) * maxThumbTop;
    const visible = scrollHeight > clientHeight;
    return { thumbHeight, thumbTop, visible };
}

export function aplicarEstiloThumb(thumb, { thumbHeight, thumbTop, visible }) {
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${thumbTop || 0}px)`;
    thumb.style.opacity = visible ? '1' : '0';
}

export function actualizarThumb(contenedor, thumb, alturaMinima = 40) {
    if (!contenedor || !thumb) return;
    const geometria = calcularGeometriaThumb(contenedor, alturaMinima);
    aplicarEstiloThumb(thumb, geometria);
}

export function configurarArrastreThumb(contenedor, thumb) {
    let thumbDragging = false;
    let dragStartY = 0;
    let initialScrollTop = 0;

    thumb.addEventListener('mousedown', (e) => {
        thumbDragging = true;
        dragStartY = e.clientY;
        initialScrollTop = contenedor.scrollTop;
        thumb.classList.add('arrastrando');
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!thumbDragging) return;
        const deltaY = e.clientY - dragStartY;
        const scrollRatio = (contenedor.scrollHeight - contenedor.clientHeight) / (contenedor.clientHeight - thumb.offsetHeight);
        contenedor.scrollTop = initialScrollTop + (deltaY * scrollRatio);
    });

    document.addEventListener('mouseup', () => {
        if (thumbDragging) {
            thumbDragging = false;
            thumb.classList.remove('arrastrando');
            document.body.style.userSelect = '';
        }
    });
}

export function inicializarScrollbar(contenedor, thumb, opciones = {}) {
    if (!contenedor || !thumb) return () => {};
    const alturaMinima = opciones.alturaMinima || 40;

    const actualizar = () => actualizarThumb(contenedor, thumb, alturaMinima);

    contenedor.addEventListener('scroll', actualizar, { passive: true });
    configurarArrastreThumb(contenedor, thumb);

    if (opciones.escucharResize) {
        window.addEventListener('resize', actualizar);
    }

    actualizar();
    return actualizar;
}
