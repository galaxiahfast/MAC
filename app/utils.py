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

def obtener_siguiente_id_dispositivo():
    """Obtiene el siguiente ID disponible para un nuevo dispositivo (pc_XX)"""
    ruta_json = 'app/static/data/dispositivos.json'
    with open(ruta_json, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    max_num = 0
    for dispositivo in data.get('dispositivos', []):
        id_actual = dispositivo.get('id', '')
        if id_actual.startswith('pc_'):
            try:
                num = int(id_actual.split('_')[1])
                if num > max_num:
                    max_num = num
            except (ValueError, IndexError):
                pass
    
    siguiente = max_num + 1
    return f"pc_{siguiente:02d}"


def agregar_dispositivo_a_json(x, y, detalles):
    """Agrega un nuevo dispositivo/punto al JSON"""
    ejecutar_respaldo()
    ruta_json = 'app/static/data/dispositivos.json'
    
    with open(ruta_json, 'r+', encoding='utf-8') as f:
        data = json.load(f)
        
        # Obtener apartados válidos
        apartados_validos = data.get('configuracion', {}).get('apartados', [])
        
        # Validar que todos los detalles correspondan a apartados existentes
        for clave in detalles.keys():
            if clave not in apartados_validos:
                raise ValueError(f"El apartado '{clave}' no está configurado. Agrégalo primero en la configuración.")
        
        # Generar nuevo ID
        nuevo_id = obtener_siguiente_id_dispositivo()
        
        # Crear nuevo dispositivo (coordenadas recibidas, que serán "50%", "50%")
        nuevo_dispositivo = {
            "id": nuevo_id,
            "x": x,
            "y": y,
            "detalles": detalles
        }
        
        # Asegurar que la lista de dispositivos existe
        if 'dispositivos' not in data:
            data['dispositivos'] = []
        
        # Agregar a la lista
        data['dispositivos'].append(nuevo_dispositivo)
        
        # Guardar cambios
        f.seek(0)
        json.dump(data, f, indent=4, ensure_ascii=False)
        f.truncate()
    
    return nuevo_dispositivo

"""
==========================================================================
OPERACIONES DE ESCRITURA Y MODIFICACIÓN DE JSON (AGREGAR)
==========================================================================
"""
def agregar_apartado_a_json(nombre_nuevo, valor_defecto):
    ejecutar_respaldo()
    ruta_json = 'app/static/data/dispositivos.json'
    # Normalizar: mayúsculas, sin tildes, espacios a _
    nombre_normalizado = nombre_nuevo.strip().upper()
    nombre_normalizado = nombre_normalizado.replace(" ", "_")
    nombre_normalizado = nombre_normalizado.replace("Á", "A").replace("É", "E").replace("Í", "I").replace("Ó", "O").replace("Ú", "U")
    
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
    # Normalizar igual que al agregar
    nombre_normalizado = nombre_a_borrar.strip().upper()
    nombre_normalizado = nombre_normalizado.replace(" ", "_")
    nombre_normalizado = nombre_normalizado.replace("Á", "A").replace("É", "E").replace("Í", "I").replace("Ó", "O").replace("Ú", "U")
    
    with open(ruta_json, 'r+', encoding='utf-8') as f:
        data = json.load(f)
        
        if nombre_normalizado not in data['configuracion']['apartados']:
            raise ValueError(f"El apartado '{nombre_a_borrar}' no existe")
        
        data['configuracion']['apartados'].remove(nombre_normalizado)
        
        for dispositivo in data['dispositivos']:
            if nombre_normalizado in dispositivo['detalles']:
                del dispositivo['detalles'][nombre_normalizado]
        
        f.seek(0)
        json.dump(data, f, indent=4, ensure_ascii=False)
        f.truncate()