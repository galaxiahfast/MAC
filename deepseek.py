import os
from PIL import Image

def generar_variantes_plano(ruta_original, carpeta_destino):
    # @galaxiahfast - Carga la imagen maestra y extrae sus dimensiones estructurales nativas.
    if not os.path.exists(ruta_original):
        print(f"Error: No se encontró el archivo original en '{ruta_original}'")
        return

    imagen_maestra = Image.open(ruta_original)
    ancho_original, alto_original = imagen_maestra.size
    relacion_aspecto = alto_original / ancho_original

    # @galaxiahfast - Mapeo de configuraciones adaptativas basadas estrictamente en la nueva nomenclatura en español.
    configuracion_variantes = {
        "planoMovil.webp": 412,
        "planoMovil2x.webp": 824,
        "planoBajaResolucion.webp": 750,
        "planoMediaResolucion.webp": 1200,
        "planoAltaResolucion.webp": 2294
    }

    print(f"Iniciando procesamiento de plano maestro ({ancho_original}x{alto_original})...")
    os.makedirs(carpeta_destino, exist_ok=True)

    # @galaxiahfast - Itera la matriz de configuración, escala proporcionalmente y exporta en formato WebP comprimido.
    for nombre_archivo, nuevo_ancho in configuracion_variantes.items():
        # @galaxiahfast - Si la variante requiere las dimensiones nativas exactas, se conserva el original sin remuestreo.
        if nuevo_ancho == ancho_original:
            nuevo_alto = alto_original
            imagen_redimensionada = imagen_maestra
        else:
            nuevo_alto = int(nuevo_ancho * relacion_aspecto)
            imagen_redimensionada = imagen_maestra.resize(
                (nuevo_ancho, nuevo_alto), 
                Image.Resampling.LANCZOS
            )

        ruta_salida = os.path.join(carpeta_destino, nombre_archivo)
        
        # @galaxiahfast - Guarda el archivo aplicando compresión WebP optimizada sin pérdida excesiva de fidelidad visual.
        imagen_redimensionada.save(
            ruta_salida, 
            "WEBP", 
            quality=85, 
            method=6
        )
        print(f" -> Generado exitosamente: {nombre_archivo} ({nuevo_ancho}x{nuevo_alto})")

    print("Proceso de optimización responsive finalizado.")

if __name__ == "__main__":
    # @galaxiahfast - Orquestación de rutas locales (Modifica según la arquitectura de directorios de tu proyecto Flask).
    archivo_origen = "aplicacion/static/img/plano.png"
    directorio_salida = "aplicacion/static/img"
    
    generar_variantes_plano(archivo_origen, directorio_salida)