
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

    -- @galaxiahfast: Coordenada horizontal del nodo.
    posicionX VARCHAR(10) NOT NULL,

    -- @galaxiahfast: Coordenada vertical del nodo.
    posicionY VARCHAR(10) NOT NULL,

    -- @galaxiahfast: Controla si el dispositivo debe renderizarse visualmente.
    estadoVisible BOOLEAN NOT NULL DEFAULT TRUE,

    -- @galaxiahfast: Bandera de borrado lógico para papelera de reciclaje.
    estadoEliminado BOOLEAN NOT NULL DEFAULT FALSE,

    -- @galaxiahfast: Fecha y hora de creación del dispositivo.
    fechaCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- @galaxiahfast: Fecha y hora de eliminación lógica.
    fechaEliminacion DATETIME NULL
);

/* ==========================================================================
   TABLA: APARTADOS
   ==========================================================================
   @galaxiahfast: Catálogo maestro de atributos dinámicos reutilizables.
   ========================================================================== */

CREATE TABLE apartados (

    -- @galaxiahfast: ID único autoincremental del apartado.
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- @galaxiahfast: Nombre técnico del atributo dinámico.
    nombreApartado VARCHAR(100) NOT NULL,

    -- @galaxiahfast: Valor global asignado automáticamente a nuevos registros.
    valorPredeterminado TEXT NULL,

    -- @galaxiahfast: Bandera de borrado lógico para papelera de reciclaje.
    estadoEliminado BOOLEAN NOT NULL DEFAULT FALSE,

    -- @galaxiahfast: Fecha y hora de creación del apartado.
    fechaCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- @galaxiahfast: Fecha y hora de eliminación lógica.
    fechaEliminacion DATETIME NULL
);

/* ==========================================================================
   TABLA: DETALLES DE DISPOSITIVOS
   ==========================================================================
   @galaxiahfast: Tabla EAV que almacena valores dinámicos por dispositivo.
   ========================================================================== */

CREATE TABLE detallesDispositivos (

    -- @galaxiahfast: ID único autoincremental del detalle dinámico.
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- @galaxiahfast: FK del dispositivo asociado.
    idDispositivo INT NOT NULL,

    -- @galaxiahfast: FK del apartado dinámico asociado.
    idApartado INT NOT NULL,

    -- @galaxiahfast: Valor específico almacenado para el dispositivo.
    valorDetalle TEXT NULL,

    -- @galaxiahfast: Indica si el valor fue modificado manualmente por el usuario.
    fuePersonalizado BOOLEAN NOT NULL DEFAULT FALSE,

    -- @galaxiahfast: Fecha automática de creación y actualización del detalle.
    fechaActualizacion DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    -- @galaxiahfast: Relación de integridad hacia dispositivos.
    CONSTRAINT fk_detalle_dispositivo
        FOREIGN KEY (idDispositivo) REFERENCES dispositivos(id),

    -- @galaxiahfast: Relación de integridad hacia apartados.
    CONSTRAINT fk_detalle_apartado
        FOREIGN KEY (idApartado) REFERENCES apartados(id),

    -- @galaxiahfast: Impide duplicar un mismo apartado dentro del mismo dispositivo.
    CONSTRAINT uq_dispositivo_apartado
        UNIQUE (idDispositivo, idApartado)
);

/* ==========================================================================
   ÍNDICES DE OPTIMIZACIÓN
   ==========================================================================
   @galaxiahfast: Índices B-Tree para acelerar búsquedas y filtros frecuentes.
   ========================================================================== */

-- @galaxiahfast: Optimiza reconstrucción dinámica de propiedades por dispositivo.
CREATE INDEX idx_detalles_dispositivo ON detallesDispositivos(idDispositivo);

-- @galaxiahfast: Optimiza búsquedas inversas por apartado dinámico.
CREATE INDEX idx_detalles_apartado ON detallesDispositivos(idApartado);

-- @galaxiahfast: Optimiza consultas filtrando dispositivos eliminados.
CREATE INDEX idx_dispositivos_eliminados ON dispositivos(estadoEliminado);

-- @galaxiahfast: Optimiza consultas filtrando apartados eliminados.
CREATE INDEX idx_apartados_eliminados ON apartados(estadoEliminado);

-- @galaxiahfast: Garantiza nombres únicos únicamente entre apartados activos.
CREATE UNIQUE INDEX uq_apartado_activo
ON apartados(nombreApartado);




#