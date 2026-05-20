
```text
========================================================================
1.2 MONITOR DE RED - @GALAXIAHFAST
========================================================================

[ ENTORNO DE DESARROLLO ]
  Entorno Conda:          MAC
  Intérprete:             Python 3.12+
  Servidor Base:          Flask (http://localhost:5000)

[ DEPENDENCIAS DEL SISTEMA ]
  Framework:              pip install flask
  Optimización:           pip install Flask-Compress
  Optimización:           pip install Flask-Minify
  Optimización:           pip install cssmin

[ INFRAESTRUCTURA NODE.JS & PNPM ]
  Runtime Engine:         [https://nodejs.org/es/download](https://nodejs.org/es/download)
  Políticas de Execution: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
  Instalador de Paquetes: iwr [https://get.pnpm.io/install.ps1](https://get.pnpm.io/install.ps1) -useb | iex

[ ENTORNO DE PRUEBAS & AUDITORÍA ]
  Comando Automatizado:   pnpm dlx lighthouse http://localhost:5000 --view --chrome-flags="--disable-cache"

────────────────────────────────────────────────────────────────────────
@GALAXIAHFAST • INFRAESTRUCTURA DE MONITOREO TÉCNICO • 2026
========================================================================





/* ==========================================================================
   SISTEMA DE GESTIÓN DE RED: @galaxiahfast
   ==========================================================================
   Descripción: Script de inicialización de la Base de Datos Relacional.
   Motor DB:    MySQL / MariaDB (Compatible con InnoDB Storage Engine)
   Arquitectura: Modelo de Atributos Dinámicos Extensibles (EAV Pattern)
   Codificación: UTF-8 Unicode (utf8mb4_unicode_ci)
   ========================================================================== */

-- @galaxiahfast: Inicializa la base de datos con soporte para caracteres especiales y emojis (utf8mb4).
CREATE DATABASE IF NOT EXISTS mapa_dispositivos
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE mapa_dispositivos;

/* ==========================================================================
   TABLA: DISPOSITIVOS
   ========================================================================== 
   @galaxiahfast: Almacena los nodos de red y sus coordenadas para el mapa.
   ========================================================================== */
CREATE TABLE dispositivos (

    -- @galaxiahfast: ID único autoincremental del hardware.
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- @galaxiahfast: Coordenada X (soporta porcentajes o píxeles).
    posicionX VARCHAR(10) NOT NULL,

    -- @galaxiahfast: Coordenada Y (soporta porcentajes o píxeles).
    posicionY VARCHAR(10) NOT NULL,

    -- @galaxiahfast: Control de visibilidad en el mapa del frontend.
    estadoVisible BOOLEAN NOT NULL DEFAULT TRUE,

    -- @galaxiahfast: Bandera de borrado lógico (Soft Delete).
    estadoEliminado BOOLEAN NOT NULL DEFAULT FALSE,

    -- @galaxiahfast: Fecha y hora de creación del registro.
    fechaCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- @galaxiahfast: Timestamp del borrado lógico (NULL si está activo).
    fechaEliminacion DATETIME NULL
);

/* ==========================================================================
   TABLA: APARTADOS
   ========================================================================== 
   @galaxiahfast: Catálogo maestro de campos técnicos dinámicos (IP, MAC, etc.).
   ========================================================================== */
CREATE TABLE apartados (
  
    -- @galaxiahfast: ID único del atributo dinámico.
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- @galaxiahfast: Nombre único de la propiedad técnica.
    nombreApartado VARCHAR(100) NOT NULL UNIQUE,

    -- @galaxiahfast: Valor asignado por defecto si no se especifica uno.
    valorPredeterminado TEXT NULL,

    -- @galaxiahfast: Bandera de borrado lógico para el atributo.
    estadoEliminado BOOLEAN NOT NULL DEFAULT FALSE,

    -- @galaxiahfast: Fecha y hora de alta del atributo en el catálogo.
    fechaCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- @galaxiahfast: Timestamp de la eliminación del atributo.
    fechaEliminacion DATETIME NULL
);

/* ==========================================================================
   TABLA: DETALLES DE DISPOSITIVOS
   ========================================================================== 
   @galaxiahfast: Tabla pivote EAV que asigna los valores técnicos a los dispositivos.
   ========================================================================== */
CREATE TABLE detallesDispositivos (

    -- @galaxiahfast: ID único de la relación valor-propiedad.
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- @galaxiahfast: FK del dispositivo origen.
    idDispositivo INT NOT NULL,

    -- @galaxiahfast: FK del atributo dinámico.
    idApartado INT NOT NULL,

    -- @galaxiahfast: Valor específico del atributo para el dispositivo.
    valorDetalle TEXT NULL,

    -- @galaxiahfast: Fecha de inserción y actualización automática de cambios.
    fechaActualizacion DATETIME NOT NULL 
        DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,

    -- @galaxiahfast: Relación de integridad con la tabla dispositivos.
    CONSTRAINT relacionDetalleDispositivo
        FOREIGN KEY (idDispositivo)
        REFERENCES dispositivos(id),

    -- @galaxiahfast: Relación de integridad con la tabla apartados.
    CONSTRAINT relacionDetalleApartado
        FOREIGN KEY (idApartado)
        REFERENCES apartados(id),

    -- @galaxiahfast: Garantiza un único valor por propiedad por dispositivo.
    CONSTRAINT relacionUnicaDispositivoApartado
        UNIQUE (idDispositivo, idApartado)
);

/* ==========================================================================
   ÍNDICES (OPTIMIZACIÓN DE CONSULTAS)
   ========================================================================== 
   @galaxiahfast: Índices B-Tree para acelerar la lectura, JOINs y filtros del API.
   ========================================================================== */

-- @galaxiahfast: Acelera la reconstrucción del JSON del dispositivo y sus relaciones.
CREATE INDEX indiceDetallesPorDispositivo
ON detallesDispositivos(idDispositivo);

-- @galaxiahfast: Optimiza la búsqueda inversa de dispositivos por propiedades (ej. buscar por IP).
CREATE INDEX indiceDetallesPorApartado
ON detallesDispositivos(idApartado);

-- @galaxiahfast: Acelera el filtrado del mapa excluyendo equipos eliminados.
CREATE INDEX indiceDispositivosEliminados
ON dispositivos(estadoEliminado);

-- @galaxiahfast: Optimiza la carga en UI listando solo atributos vigentes.
CREATE INDEX indiceApartadosEliminados
ON apartados(estadoEliminado);





#