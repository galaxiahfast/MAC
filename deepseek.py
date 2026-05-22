import os

def concatenar_archivos(ruta_destino, rutas_origen):
    """
    Concatena varios archivos en un documento de destino.
    Si el documento destino existe, lo sobrescribe.
    Elimina líneas en blanco de cada archivo.
    
    Args:
        ruta_destino (str): Ruta del archivo de destino
        rutas_origen (list): Lista con las rutas de los archivos a concatenar
    """
    try:
        # Abrir el archivo de destino en modo escritura (sobrescribe si existe)
        with open(ruta_destino, 'w', encoding='utf-8') as archivo_destino:
            
            for ruta_origen in rutas_origen:
                # Verificar si el archivo origen existe
                if not os.path.exists(ruta_origen):
                    print(f"Advertencia: El archivo {ruta_origen} no existe. Se omite.")
                    continue
                
                # Escribir encabezado con el nombre y ubicación del archivo
                nombre_archivo = os.path.basename(ruta_origen)
                ubicacion = os.path.dirname(ruta_origen)
                
                archivo_destino.write(f"=== NOMBRE: {nombre_archivo} ===\n")
                archivo_destino.write(f"=== UBICACIÓN: {ubicacion} ===\n")
                archivo_destino.write("=== CONTENIDO ===\n")
                
                # Leer y escribir el contenido del archivo origen sin líneas en blanco
                with open(ruta_origen, 'r', encoding='utf-8') as archivo_origen:
                    for linea in archivo_origen:
                        # Eliminar espacios en blanco al inicio y final, y saltar si la línea está vacía
                        linea_limpia = linea.rstrip('\n\r')
                        if linea_limpia.strip():  # Solo escribir si no es una línea en blanco
                            archivo_destino.write(linea_limpia + '\n')
                
                # Agregar una línea separadora entre archivos (opcional)
                archivo_destino.write("\n" + "="*50 + "\n\n")
        
        print(f"¡Éxito! Los archivos se han concatenado en: {ruta_destino}")
        
    except Exception as e:
        print(f"Error al procesar los archivos: {e}")

# Definir las rutas de los archivos a concatenar
rutas_archivos = [
    r"C:\Users\ortiz\Downloads\MAC\aplicacion\static\js\otros\comportamientoMenuPrincipal.js",
    r"C:\Users\ortiz\Downloads\MAC\aplicacion\templates\index.html",
    r"C:\Users\ortiz\Downloads\MAC\aplicacion\static\css\menuInferiorCentrado.css"
]

# Definir la ruta del documento de destino
documento_destino = r"C:\Users\ortiz\Downloads\documento.txt"

# Ejecutar la función
concatenar_archivos(documento_destino, rutas_archivos)