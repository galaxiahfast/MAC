// @galaxiahfast - Scroll principal de la aplicación (NO menú)
(function () {

    let scrollContainer = null;
    let thumb = null;

    let hideTimeout = null;
    let isScrolling = false;

    function actualizar() {

        if (!scrollContainer || !thumb) return;

        const scrollTop = scrollContainer.scrollTop;
        const scrollHeight = scrollContainer.scrollHeight;
        const clientHeight = scrollContainer.clientHeight;

        // Evitar división por cero
        if (scrollHeight <= clientHeight) {
            thumb.style.opacity = '0';
            return;
        }

        const ratio = clientHeight / scrollHeight;

        const thumbHeight = Math.max(ratio * clientHeight, 50);
        const maxTop = clientHeight - thumbHeight;

        const top =
            (scrollTop / (scrollHeight - clientHeight)) * maxTop;

        thumb.style.height = `${thumbHeight}px`;
        thumb.style.transform = `translateY(${top}px)`;

        // ==============================
        // Estado visual de interacción
        // ==============================
        activarEstadoScroll();
    }

    function activarEstadoScroll() {

        if (!thumb) return;

        isScrolling = true;

        thumb.classList.add('scrolling');
        thumb.style.opacity = '1';

        clearTimeout(hideTimeout);

        hideTimeout = setTimeout(() => {

            isScrolling = false;

            thumb.classList.remove('scrolling');

            // Solo ocultar si NO está hover el contenedor
            if (!scrollContainer.matches(':hover')) {
                thumb.style.opacity = '0';
            }

        }, 120);
    }

    function manejarHover() {

        if (!thumb || !scrollContainer) return;

        scrollContainer.addEventListener('mouseenter', () => {
            thumb.style.opacity = '1';
        });

        scrollContainer.addEventListener('mouseleave', () => {

            if (!isScrolling) {
                thumb.style.opacity = '0';
            }
        });
    }

    function init() {

        scrollContainer = document.getElementById(
            'contenedorPrincipalAplicacionScroll'
        );

        thumb = document.getElementById(
            'scrollbarPrincipalThumb'
        );

        if (!scrollContainer || !thumb) return;

        scrollContainer.addEventListener(
            'scroll',
            actualizar,
            { passive: true }
        );

        window.addEventListener('resize', actualizar);

        manejarHover();

        actualizar();
    }

    document.addEventListener('DOMContentLoaded', init);

})();