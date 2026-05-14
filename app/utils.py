import shutil
import os
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