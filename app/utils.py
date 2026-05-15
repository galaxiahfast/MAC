import shutil
import os
import json
from datetime import datetime

"""
==========================================================================
LÓGICA DE RESPALDO AUTOMÁTICO DE DATOS
==========================================================================
"""
def ejecutar_respaldo():
    ruta_json = 'app/static/data/dispositivos.json'
    carpeta_backup = 'app/static/data/backups'
    
    if not os.path.exists(carpeta_backup):
        os.makedirs(carpeta_backup)
    
    if os.path.exists(ruta_json):
        fecha = datetime.now().strftime("%Y%m%d_%H%M%S")
        destino = os.path.join(carpeta_backup, f"dispositivos_{fecha}.json")
        shutil.copy2(ruta_json, destino)

        backups = sorted(
            [os.path.join(carpeta_backup, f) for f in os.listdir(carpeta_backup)], 
            key=os.path.getctime
        )
        
        if len(backups) > 10:
            os.remove(backups[0])

"""
==========================================================================
OPERACIONES DE ESCRITURA Y MODIFICACIÓN DE JSON
==========================================================================
"""
def agregar_apartado_a_json(nombre_nuevo, valor_defecto):
    ejecutar_respaldo()
    ruta_json = 'app/static/data/dispositivos.json'
    nombre_normalizado = nombre_nuevo.strip().upper()
    
    with open(ruta_json, 'r+', encoding='utf-8') as f:
        data = json.load(f)
        
        if nombre_normalizado not in data['configuracion']['apartados']:
            data['configuracion']['apartados'].append(nombre_normalizado)
        
        for dispositivo in data['dispositivos']:
            dispositivo['detalles'][nombre_normalizado] = valor_defecto
        
        f.seek(0)
        json.dump(data, f, indent=4, ensure_ascii=False)
        f.truncate()

"""
==========================================================================
OPERACIONES DE ELIMINACIÓN EN JSON
==========================================================================
"""
def eliminar_apartado_de_json(nombre_a_borrar):
    ejecutar_respaldo()
    ruta_json = 'app/static/data/dispositivos.json'
    
    with open(ruta_json, 'r+', encoding='utf-8') as f:
        data = json.load(f)
        
        if nombre_a_borrar in data['configuracion']['apartados']:
            data['configuracion']['apartados'].remove(nombre_a_borrar)
        
        for dispositivo in data['dispositivos']:
            if nombre_a_borrar in dispositivo['detalles']:
                del dispositivo['detalles'][nombre_a_borrar]
        
        f.seek(0)
        json.dump(data, f, indent=4, ensure_ascii=False)
        f.truncate()