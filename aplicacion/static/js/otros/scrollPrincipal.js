// @galaxiahfast - Actualiza dinámicamente la imagen del plano según el tema activo.
function actualizarPlanoSegunTema(tema) {

    const imagen =
        document.getElementById(
            'imagenPlanoPrincipal'
        );

    if (!imagen) return;

    const sufijoTema =
        tema === 'dark'
            ? 'ModoOscuro'
            : 'ModoClaro';

    imagen.addEventListener(
        'load',
        () => {

            if (
                typeof window.actualizarScrollbarPrincipal
                === 'function'
            ) {
                window.actualizarScrollbarPrincipal();
            }

        },
        { once: true }
    );

    imagen.src =
        `/static/imagenes/planoPrincipalMovil${sufijoTema}.webp`;

    imagen.srcset = `
        /static/imagenes/planoPrincipalMovil${sufijoTema}.webp 412w,
        /static/imagenes/planoPrincipalMovil2x${sufijoTema}.webp 824w,
        /static/imagenes/planoPrincipalBajaResolucion${sufijoTema}.webp 750w,
        /static/imagenes/planoPrincipalMediaResolucion${sufijoTema}.webp 1200w,
        /static/imagenes/planoPrincipalAltaResolucion${sufijoTema}.webp 2294w
    `;
}

// @galaxiahfast - Exponer API global desacoplada.
window.actualizarPlanoSegunTema =
    actualizarPlanoSegunTema;


// @galaxiahfast - Scroll principal de la aplicación (NO menú)
(function () {

    let scrollContainer = null;
    let thumb = null;

    let hideTimeout = null;
    let isScrolling = false;

    // =====================================================
    // SOLO recalcula geometría del thumb
    // =====================================================
    function actualizar() {

        if (!scrollContainer || !thumb) return;

        const scrollTop =
            scrollContainer.scrollTop;

        const scrollHeight =
            scrollContainer.scrollHeight;

        const clientHeight =
            scrollContainer.clientHeight;

        if (scrollHeight <= clientHeight) {

            thumb.style.opacity = '0';

            return;
        }

        const ratio =
            clientHeight / scrollHeight;

        const thumbHeight =
            Math.max(
                ratio * clientHeight,
                50
            );

        const maxTop =
            clientHeight - thumbHeight;

        const top =
            (
                scrollTop /
                (scrollHeight - clientHeight)
            ) * maxTop;

        thumb.style.height =
            `${thumbHeight}px`;

        thumb.style.transform =
            `translateY(${top}px)`;
    }

    // =====================================================
    // SOLO efectos visuales de scroll
    // =====================================================
    function activarEstadoScroll() {

        if (!thumb) return;

        isScrolling = true;

        thumb.classList.add(
            'scrolling'
        );

        thumb.style.opacity = '1';

        clearTimeout(
            hideTimeout
        );

        hideTimeout =
            setTimeout(() => {

                isScrolling = false;

                thumb.classList.remove(
                    'scrolling'
                );

                if (
                    !scrollContainer.matches(
                        ':hover'
                    )
                ) {
                    thumb.style.opacity = '0';
                }

            }, 120);
    }

    // =====================================================
    // Evento real de scroll
    // =====================================================
    function manejarScroll() {

        actualizar();

        activarEstadoScroll();
    }

    function manejarHover() {

        if (
            !thumb ||
            !scrollContainer
        ) {
            return;
        }

        scrollContainer.addEventListener(
            'mouseenter',
            () => {
                thumb.style.opacity = '1';
            }
        );

        scrollContainer.addEventListener(
            'mouseleave',
            () => {

                if (!isScrolling) {
                    thumb.style.opacity = '0';
                }

            }
        );
    }

    function init() {

        scrollContainer =
            document.getElementById(
                'contenedorPrincipalAplicacionScroll'
            );

        thumb =
            document.getElementById(
                'scrollbarPrincipalThumb'
            );

        if (
            !scrollContainer ||
            !thumb
        ) {
            return;
        }

        scrollContainer.addEventListener(
            'scroll',
            manejarScroll,
            { passive: true }
        );

        window.addEventListener(
            'resize',
            actualizar
        );

        manejarHover();

        // API pública para recalcular
        // sin disparar animación.
        window.actualizarScrollbarPrincipal =
            actualizar;

        actualizar();
    }

    document.addEventListener(
        'DOMContentLoaded',
        init
    );

})();