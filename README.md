
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