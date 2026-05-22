"""
@galaxiahfast Generador de respaldo consolidado de archivos.

Descripción:
    Recorre recursivamente una carpeta y concatena el contenido
    de todos los archivos encontrados dentro de un único TXT.

Características:
    - Incluye subcarpetas automáticamente.
    - Agrega encabezado con ruta y nombre del archivo.
    - Elimina líneas vacías innecesarias.
    - Ignora archivos binarios incompatibles.
    - Usa UTF-8 cuando es posible.
    - Mantiene separación clara entre archivos.

Caso de uso:
    Consolidar proyectos JS/CSS/HTML/PY/etc. en un único archivo
    para auditoría, IA, respaldo o revisión técnica.
"""

from pathlib import Path

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

CARPETA_BASE = Path(
    r"C:\Users\MOISES INFORMATICA\Desktop\MAC\aplicacion\static\js"
)

ARCHIVO_SALIDA = Path(
    r"C:\Users\MOISES INFORMATICA\Desktop\MAC\contenido_unificado.txt"
)

# Extensiones opcionales permitidas.
# Puedes agregar más si lo necesitas.
EXTENSIONES_VALIDAS = {
    ".js",
    ".ts",
    ".json",
    ".html",
    ".css",
    ".py",
    ".txt",
    ".md"
}

# ============================================================================
# FUNCIONES
# ============================================================================

def eliminar_lineas_vacias(contenido: str) -> str:
    """
    Elimina líneas completamente vacías.

    Args:
        contenido: Texto original.

    Returns:
        Texto limpio sin líneas vacías.
    """

    lineas_limpias = [
        linea.rstrip()
        for linea in contenido.splitlines()
        if linea.strip()
    ]

    return "\n".join(lineas_limpias)


def leer_archivo(ruta_archivo: Path) -> str | None:
    """
    Intenta leer un archivo usando UTF-8.

    Args:
        ruta_archivo: Archivo a leer.

    Returns:
        Contenido del archivo o None si falla.
    """

    try:
        return ruta_archivo.read_text(
            encoding="utf-8",
            errors="ignore"
        )

    except Exception as error:
        print(f"[ERROR] No se pudo leer: {ruta_archivo}")
        print(f"Motivo: {error}")

        return None


def generar_consolidado() -> None:
    """
    Genera el archivo consolidado.
    """

    archivos_procesados = 0

    with ARCHIVO_SALIDA.open(
        mode="w",
        encoding="utf-8"
    ) as salida:

        for archivo in CARPETA_BASE.rglob("*"):

            if not archivo.is_file():
                continue

            if archivo.suffix.lower() not in EXTENSIONES_VALIDAS:
                continue

            contenido = leer_archivo(archivo)

            if contenido is None:
                continue

            contenido = eliminar_lineas_vacias(contenido)

            encabezado = (
                "\n"
                + "=" * 100
                + "\n"
                + f"ARCHIVO: {archivo.name}\n"
                + f"UBICACIÓN: {archivo}\n"
                + "=" * 100
                + "\n\n"
            )

            salida.write(encabezado)
            salida.write(contenido)
            salida.write("\n\n")

            archivos_procesados += 1

    print("=" * 60)
    print("PROCESO FINALIZADO")
    print(f"Archivos procesados: {archivos_procesados}")
    print(f"Archivo generado: {ARCHIVO_SALIDA}")
    print("=" * 60)


# ============================================================================
# EJECUCIÓN
# ============================================================================

if __name__ == "__main__":
    generar_consolidado()