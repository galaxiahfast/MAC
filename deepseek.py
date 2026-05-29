from pathlib import Path

from PIL import Image
from PIL import ImageOps


# @galaxiahfast - Carpeta donde están las imágenes.
RUTA_IMAGENES = Path(
    r"C:\Users\MOISES INFORMATICA\Desktop\MAC\aplicacion\static\imagenes"
)


# @galaxiahfast - Relación entre nombres originales y nuevos nombres modo claro.
MAPA_ARCHIVOS = {
    "planoMovil2x.webp": "planoPrincipalMovil2xModoClaro.webp",
    "planoMovil.webp": "planoPrincipalMovilModoClaro.webp",
    "planoMediaResolucion.webp": "planoPrincipalMediaResolucionModoClaro.webp",
    "planoBajaResolucion.webp": "planoPrincipalBajaResolucionModoClaro.webp",
    "planoAltaResolucion.webp": "planoPrincipalAltaResolucionModoClaro.webp",
}


# @galaxiahfast - Genera nombre equivalente modo oscuro.
def generar_nombre_modo_oscuro(nombre_modo_claro: str) -> str:
    return nombre_modo_claro.replace("ModoClaro", "ModoOscuro")


# @galaxiahfast - Renombra archivos originales y genera versiones dark.
def procesar_imagenes() -> None:

    for nombre_original, nuevo_nombre_claro in MAPA_ARCHIVOS.items():

        ruta_original = RUTA_IMAGENES / nombre_original
        ruta_claro = RUTA_IMAGENES / nuevo_nombre_claro

        # ================================================================
        # VALIDACIÓN
        # ================================================================

        if not ruta_original.exists():
            print(f"[ERROR] No existe: {ruta_original.name}")
            continue

        # ================================================================
        # RENOMBRAR MODO CLARO
        # ================================================================

        if not ruta_claro.exists():
            ruta_original.rename(ruta_claro)
            print(f"[OK] Renombrado: {ruta_original.name} -> {ruta_claro.name}")
        else:
            print(f"[INFO] Ya existe: {ruta_claro.name}")

        # ================================================================
        # GENERAR MODO OSCURO
        # ================================================================

        nombre_oscuro = generar_nombre_modo_oscuro(nuevo_nombre_claro)
        ruta_oscuro = RUTA_IMAGENES / nombre_oscuro

        if ruta_oscuro.exists():
            print(f"[INFO] Ya existe versión dark: {ruta_oscuro.name}")
            continue

        with Image.open(ruta_claro) as imagen:

            # @galaxiahfast - Convierte a RGB antes de invertir colores.
            imagen_rgb = imagen.convert("RGB")

            # @galaxiahfast - Genera versión invertida tipo dark mode.
            imagen_dark = ImageOps.invert(imagen_rgb)

            # @galaxiahfast - Guarda imagen dark optimizada en WEBP.
            imagen_dark.save(
                ruta_oscuro,
                format="WEBP",
                quality=95,
                method=6,
            )

            print(f"[OK] Generado dark: {ruta_oscuro.name}")


# @galaxiahfast - Punto de entrada principal.
if __name__ == "__main__":
    procesar_imagenes()