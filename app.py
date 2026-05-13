from flask import Flask, render_template_string, request, jsonify, make_response
from scapy.all import ARP, Ether, srp
import socket
import json
import os
import threading
import time
import shutil  # Para el sistema de respaldos
from datetime import datetime, timedelta

app = Flask(__name__)

# --- CONFIGURACIÓN Y CARGA DE DATOS ---
JSON_FILE = 'devices.json'
BACKUP_FILE = 'devices.json.bak'
IP_RANGE = "192.168.2.0/24"
last_scan_results = [] 

def load_devices():
    """Carga dispositivos con validación de integridad."""
    if os.path.exists(JSON_FILE):
        try:
            # Si el archivo está vacío pero existe el backup, restaurar
            if os.path.getsize(JSON_FILE) == 0 and os.path.exists(BACKUP_FILE):
                print("Archivo principal vacío. Restaurando desde backup...")
                shutil.copy(BACKUP_FILE, JSON_FILE)
            
            with open(JSON_FILE, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if not content:
                    return []
                return json.loads(content)
        except Exception as e:
            print(f"Error cargando JSON: {e}")
            # Intentar cargar desde el backup si el principal falló
            if os.path.exists(BACKUP_FILE):
                try:
                    with open(BACKUP_FILE, 'r', encoding='utf-8') as f:
                        return json.load(f)
                except: return []
            return []
    return []

def save_devices(devices):
    """Guarda dispositivos creando un respaldo previo."""
    try:
        # 1. Verificar si los datos actuales son válidos antes de guardar
        if not isinstance(devices, list):
            print("Error: Se intentó guardar datos corruptos (no es una lista).")
            return False

        # 2. Crear respaldo del archivo actual si tiene contenido
        if os.path.exists(JSON_FILE) and os.path.getsize(JSON_FILE) > 0:
            shutil.copy(JSON_FILE, BACKUP_FILE)
        
        # 3. Escribir nuevos datos
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(devices, f, indent=4, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error guardando JSON: {e}")
        return False

def scan_network_logic():
    devices = load_devices()
    arp = ARP(pdst=IP_RANGE)
    ether = Ether(dst="ff:ff:ff:ff:ff:ff")
    packet = ether/arp
    online_map = {}
    
    try:
        result = srp(packet, timeout=2, verbose=False)[0]
        for sent, received in result:
            online_map[received.hwsrc.lower()] = received.psrc
    except: pass

    results = []
    for dev in devices:
        if dev.get("hidden") == True: continue
        mac = dev["mac"].lower()
        
        if mac in online_map:
            ip = online_map[mac]
            try: 
                hostname = socket.gethostbyaddr(ip)[0]
            except: 
                hostname = dev.get("host") or dev.get("name") or "DATAMID"
            
            results.append({**dev, "status": "CONECTADO", "ip": ip, "host": hostname})
        else:
            results.append({
                **dev, 
                "status": "DESCONECTADO", 
                "ip": "N/A", 
                "host": dev.get("host") or dev.get("name")
            })
    return results

def background_scanner():
    global last_scan_results
    while True:
        last_scan_results = scan_network_logic()
        time.sleep(60)

threading.Thread(target=background_scanner, daemon=True).start()

@app.route('/')
def index():
    global last_scan_results
    devices_info = scan_network_logic() 
    last_scan_results = devices_info 
    
    markers_html = ""
    generic_expiry = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d %H:%M:%S")

    for info in devices_info:
        dot_color = "#4ade80" if info["status"] == "CONECTADO" else "#f87171"
        clean_id = info['mac'].replace(':', '')
        k_expiry = info.get('kaspersky_expiry') or generic_expiry
        copy_text = f"USUARIO: {info.get('usuario', '-')}\\nDISPOSITIVO: {info['name']}\\nIP: {info['ip']}"

        markers_html += f"""
        <div class="marker-wrapper" id="dev-{clean_id}" 
             style="top: {info['pos_y']}; left: {info['pos_x']};"
             onmousedown="startDrag(event, '{info['mac']}')">
            
            <div class="punto" style="background: {dot_color}; box-shadow: 0 0 15px {dot_color};"></div>
            
            <div class="info-box" data-mac="{info['mac']}">
                <div class="status-row">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span class="label-header edit-field" contenteditable="false" data-key="name">{info['name']}</span>
                        <div style="display:flex; gap:4px;">
                            <button onclick="copyToClipboard('{copy_text}', this)" class="action-btn" title="COPIAR">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            </button>
                            <button onclick="toggleEditMode('{info['mac']}', this)" class="action-btn edit-trigger" title="EDITAR">
                                <svg class="edit-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                <svg class="save-icon" style="display:none;" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                            </button>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span class="online-status" style="color: {dot_color};">● {info['status']}</span>
                        <button onclick="hideDevice('{info['mac']}')" class="delete-btn" title="OCULTAR">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
                
                <div class="scroll-content">
                    <div class="label" style="margin-top: 0;">USUARIO</div>
                    <div class="data edit-field" contenteditable="false" data-key="usuario">{info.get('usuario', '-')}</div>

                    <div class="label">ÁREA</div>
                    <div class="data edit-field" contenteditable="false" data-key="area">{info.get('area', 'N/A')}</div>

                    <div class="label">ESTADO DE SERVICIOS</div>
                    <div class="software-section">
                        <div class="sw-row">
                            <div class="sw-group">
                                <span class="sw-name">ACTIVITY WATCH:</span>
                                <span class="sw-status" style="color: {'#4ade80' if info.get('aw_active') else '#f87171'};">{'ACTIVO' if info.get('aw_active') else 'INACTIVO'}</span>
                            </div>
                            <label class="switch is-locked">
                                <input type="checkbox" {'checked' if info.get('aw_active') else ''} onchange="toggleSW('{info['mac']}', 'aw_active', this.checked, this)">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="sw-row">
                            <div class="sw-group">
                                <span class="sw-name">KASPERSKY:</span>
                                <span class="sw-status" style="color: {'#4ade80' if info.get('kaspersky_active') else '#f87171'};">{'ACTIVO' if info.get('kaspersky_active') else 'INACTIVO'}</span>
                                <span class="countdown" data-expiry="{k_expiry}" style="display: {'inline' if info.get('kaspersky_active') else 'none'};"></span>
                            </div>
                            <label class="switch is-locked">
                                <input type="checkbox" {'checked' if info.get('kaspersky_active') else ''} onchange="toggleSW('{info['mac']}', 'kaspersky_active', this.checked, this)">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="sw-row">
                            <div class="sw-group">
                                <span class="sw-name">TIPO DE CONTRATO:</span>
                                <span class="sw-status" style="color: #4ade80;">{'TIEMPO COMPLETO' if info.get('becario_active') else 'BECARIO'}</span>
                            </div>
                            <label class="switch is-locked">
                                <input type="checkbox" {'checked' if info.get('becario_active') else ''} onchange="toggleSW('{info['mac']}', 'becario_active', this.checked, this)">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>

                    <div class="label">NOMBRE DEL HOST</div>
                    <div class="data edit-field" contenteditable="false" data-key="host">{info['host']}</div>
                    
                    <div class="label">DIRECCIÓN IP</div>
                    <div class="data no-edit">{info['ip']}</div>
                    
                    <div class="label">DIRECCIÓN MAC</div>
                    <div class="data no-edit">{info['mac']}</div>

                    <div class="label">ID DEL PRODUCTO</div>
                    <div class="data no-edit">{info.get('product_id', 'N/A')}</div>

                    <div class="label">ID DEL DISPOSITIVO</div>
                    <div class="data no-edit">{info.get('device_id', 'N/A')}</div>
                </div>
            </div>
        </div>
        """
    
    response = make_response(render_template_string(HTML_BODY.replace("{markers_html}", markers_html)))
    response.headers['Content-Type'] = 'text/html; charset=utf-8'
    return response

@app.route('/update_generic', methods=['POST'])
def update_generic():
    data = request.json
    devices = load_devices()
    for dev in devices:
        if dev['mac'].lower() == data['mac'].lower():
            dev[data['key']] = data['value'].upper()
            break
    save_devices(devices)
    return jsonify({"status": "success"})

@app.route('/update_sw', methods=['POST'])
def update_sw():
    data = request.json
    devices = load_devices()
    for dev in devices:
        if dev['mac'].lower() == data['mac'].lower():
            dev[data['key']] = data['value']
            break
    save_devices(devices)
    return jsonify({"status": "success"})

@app.route('/update_position', methods=['POST'])
def update_position():
    data = request.json
    devices = load_devices()
    for dev in devices:
        if dev['mac'].lower() == data['mac'].lower():
            dev['pos_x'] = data['pos_x']
            dev['pos_y'] = data['pos_y']
            break
    save_devices(devices)
    return jsonify({"status": "success"})

@app.route('/hide_device', methods=['POST'])
def hide_device():
    data = request.json
    devices = load_devices()
    for dev in devices:
        if dev['mac'].lower() == data['mac'].lower():
            dev['hidden'] = True
            break
    save_devices(devices)
    return jsonify({"status": "success"})

HTML_BODY = """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        :root { --accent: #38bdf8; --bg-dark: rgba(15, 23, 42, 0.98); --border: #334155; --success: #4ade80; --danger: #f87171; }
        
        body { font-family: 'Inter', sans-serif; background: #0f172a; margin: 0; padding: 50px; text-transform: uppercase; }
        .map-container { position: relative; border-radius: 12px; border: 1px solid var(--border); background: #1e293b; margin: 0 auto; width: fit-content; background-image: radial-gradient(circle, #334155 1.5px, transparent 1.5px); background-size: 2% 2%; }
        .plano-img { display: block; opacity: 0.7; pointer-events: none; }
        
        .marker-wrapper { position: absolute; z-index: 10; transform: translate(-50%, -50%); cursor: move; padding: 10px; }
        .marker-wrapper:hover { z-index: 9999 !important; }
        .punto { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #fff; transition: background 0.5s; position: relative; z-index: 11; pointer-events: none; }
        
        .info-box { 
            position: absolute; top: 55px; left: 50%; transform: translateX(-50%) translateY(10px); 
            width: 320px; background: var(--bg-dark); backdrop-filter: blur(15px); 
            border: 2px solid var(--accent); border-radius: 12px; padding: 15px; color: white; 
            opacity: 0; visibility: hidden; transition: all 0.2s ease-out; 
            z-index: 100; pointer-events: auto; text-align: left;
        }
        .marker-wrapper:hover .info-box { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
        
        .scroll-content { overflow-y: auto; height: 280px; padding-right: 8px; text-align: left; }
        .scroll-content::-webkit-scrollbar { width: 4px; }
        .scroll-content::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        
        .edit-field { font-size: 12px; transition: all 0.2s; padding: 2px 4px; border-radius: 4px; border: 1px solid transparent; display: block; text-align: left; text-transform: uppercase; }
        .edit-field[contenteditable="true"] { background: rgba(56, 189, 248, 0.1); border: 1px dashed var(--accent); outline: none; }
        
        .switch.is-locked { pointer-events: none; opacity: 0.7; }
        .is-editing .switch.is-locked { pointer-events: auto; opacity: 1; }

        .label-header { font-size: 12px; font-weight: 700; min-width: 50px; display: inline-block; padding-left: 4px; color: #fff; }
        .online-status { font-size: 12px; font-weight: 700; }
        
        .label { font-size: 12px; color: var(--accent); text-transform: uppercase; font-weight: 700; margin-top: 12px; margin-bottom: 4px; padding-left: 4px; letter-spacing: 0.5px; }
        .data { font-size: 12px; color: #f1f5f9; margin-bottom: 12px; padding: 2px 4px; word-break: break-all; text-align: left; }
        .no-edit { padding-left: 4px; font-size: 12px; }
        
        .sw-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 4px; }
        .sw-group { display: flex; align-items: center; min-width: 160px; }
        .sw-name { font-size: 12px; font-weight: 700; }
        .sw-status { font-size: 12px; font-weight: 800; margin-left: 5px; }
        .countdown { font-size: 12px; font-weight: 700; color: var(--success); margin-left: 5px; }
        
        .switch { position: relative; display: inline-block; width: 28px; height: 16px; text-transform: none; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #475569; transition: .3s; border-radius: 20px; }
        .slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--success); }
        input:checked + .slider:before { transform: translateX(12px); }
        
        .action-btn, .delete-btn { background: none; border: none; color: var(--accent); cursor: pointer; padding: 4px; display: flex; align-items: center; transition: transform 0.1s; }
        .action-btn:active { transform: scale(0.9); }
        .delete-btn { color: var(--danger); }
        .status-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 15px; }
    </style>
</head>
<body>
<div class="map-container" id="map">
    <img src="/static/plano.png" class="plano-img">
    {markers_html}
</div>

<script>
    function toggleEditMode(mac, btn) {
        const box = btn.closest('.info-box');
        const isEditing = box.classList.toggle('is-editing');
        const fields = box.querySelectorAll('.edit-field');
        const editIcon = btn.querySelector('.edit-icon');
        const saveIcon = btn.querySelector('.save-icon');

        if (isEditing) {
            fields.forEach(f => f.contentEditable = "true");
            editIcon.style.display = 'none';
            saveIcon.style.display = 'block';
            btn.style.color = '#4ade80';
        } else {
            fields.forEach(f => {
                f.contentEditable = "false";
                updateField(mac, f.getAttribute('data-key'), f.innerText);
            });
            editIcon.style.display = 'block';
            saveIcon.style.display = 'none';
            btn.style.color = '';
        }
    }

    function updateField(mac, key, value) {
        fetch('/update_generic', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ mac: mac, key: key, value: value.trim().toUpperCase() })
        });
    }

    function hideDevice(mac) {
        if(!confirm("¿ESTÁS SEGURO DE QUE DESEAS OCULTAR ESTE DISPOSITIVO DEL PLANO?")) return;
        fetch('/hide_device', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ mac: mac })
        }).then(() => { location.reload(); });
    }

    function toggleSW(mac, key, val, inputEl) {
        fetch('/update_sw', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ mac: mac, key: key, value: val })
        }).then(() => {
            const row = inputEl.closest('.sw-row');
            const statusSpan = row.querySelector('.sw-status');
            if (key === 'becario_active') {
                statusSpan.innerText = val ? "TIEMPO COMPLETO" : "BECARIO";
            } else {
                statusSpan.innerText = val ? "ACTIVO" : "INACTIVO";
                statusSpan.style.color = val ? "#4ade80" : "#f87171";
            }
        });
    }

    let activeDev = null;
    function startDrag(e, mac) {
        if (e.target.isContentEditable || e.target.closest('button') || e.target.closest('.switch') || e.target.closest('.scroll-content')) {
            if (!e.target.classList.contains('info-box') && !e.target.classList.contains('status-row')) return;
        }

        const el = document.getElementById('dev-' + mac.replace(/:/g, ''));
        activeDev = { el: el, mac: mac };
        el.style.zIndex = "10000";
        
        document.onmousemove = (ev) => {
            if (!activeDev) return;
            const map = document.getElementById('map').getBoundingClientRect();
            let x = Math.min(Math.max(0, ((ev.clientX - map.left) / map.width) * 100), 100);
            let y = Math.min(Math.max(0, ((ev.clientY - map.top) / map.height) * 100), 100);
            activeDev.el.style.left = x.toFixed(0) + '%';
            activeDev.el.style.top = y.toFixed(0) + '%';
        };
        
        document.onmouseup = () => {
            if (activeDev) {
                fetch('/update_position', { 
                    method: 'POST', headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify({ mac: activeDev.mac, pos_x: activeDev.el.style.left, pos_y: activeDev.el.style.top })
                });
                activeDev.el.style.zIndex = "10";
            }
            activeDev = null; document.onmousemove = null;
        };
    }

    function updateTimers() {
        document.querySelectorAll('.countdown').forEach(el => {
            if (el.offsetParent === null) return;
            const diff = new Date(el.dataset.expiry) - new Date();
            if (diff <= 0) { el.innerText = " (EXPIRADO)"; return; }
            const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
            el.innerText = ` (${d}D ${h}H ${m}M ${s}S)`;
        });
    }
    setInterval(updateTimers, 1000);

    function copyToClipboard(text, btn) {
        navigator.clipboard.writeText(text.replace(/\\\\n/g, '\\n')).then(() => {
            const old = btn.innerHTML; btn.innerHTML = 'COPIADO';
            setTimeout(() => { btn.innerHTML = old; }, 2000);
        });
    }
</script>
</body>
</html>
"""

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)