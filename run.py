from app import create_app

# ==========================================================================
# PUNTO DE ENTRADA Y LANZAMIENTO DEL SERVIDOR
# ==========================================================================
app = create_app()
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)