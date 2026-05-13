function updateField(mac, key, value) {
    fetch('/update_generic', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ mac: mac, key: key, value: value.trim() })
    });
}

let activeDev = null;

function startDrag(e, mac) {
    // Solo arrastrar si se hace clic en el punto o en el fondo del marcador, 
    // no si se está editando texto.
    if (e.target.isContentEditable) return;

    const el = document.getElementById('dev-' + mac.replace(/:/g, ''));
    activeDev = { el: el, mac: mac };
    el.style.zIndex = "1000";

    document.onmousemove = (ev) => {
        if (!activeDev) return;
        const map = document.getElementById('map').getBoundingClientRect();
        
        let x = ((ev.clientX - map.left) / map.width) * 100;
        let y = ((ev.clientY - map.top) / map.height) * 100;
        
        // Limitar dentro del mapa
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        activeDev.el.style.left = x.toFixed(2) + '%';
        activeDev.el.style.top = y.toFixed(2) + '%';
    };

    document.onmouseup = () => {
        if (activeDev) {
            fetch('/update_position', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    mac: activeDev.mac, 
                    pos_x: activeDev.el.style.left, 
                    pos_y: activeDev.el.style.top 
                })
            });
            activeDev.el.style.zIndex = "10";
        }
        activeDev = null;
        document.onmousemove = null;
    };
}

// Timer para la expiración de Kaspersky
setInterval(() => {
    document.querySelectorAll('.countdown').forEach(el => {
        const expiry = new Date(el.dataset.expiry);
        const now = new Date();
        const diff = expiry - now;

        if (diff <= 0) {
            el.innerText = "EXPIRADO";
            el.style.color = "#f87171";
        } else {
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            el.innerText = `${d}d ${h}h ${m}m restantes`;
        }
    });
}, 1000);

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerText;
        btn.innerText = "✅";
        setTimeout(() => btn.innerText = original, 1500);
    });
}