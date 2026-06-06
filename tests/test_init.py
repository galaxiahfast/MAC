import pytest
from unittest.mock import patch, MagicMock


class TestCrearAplicacion:

    def test_retorna_instancia_flask(self, app):
        assert app is not None
        assert app.name == 'aplicacion'

    def test_cache_deshabilitada(self, app):
        assert app.config['SEND_FILE_MAX_AGE_DEFAULT'] == 0

    def test_templates_auto_reload(self, app):
        assert app.config['TEMPLATES_AUTO_RELOAD'] is True

    def test_compress_min_size(self, app):
        assert app.config['COMPRESS_MIN_SIZE'] == 0

    def test_compress_mimetypes(self, app):
        mimetypes = app.config['COMPRESS_MIMETYPES']
        assert 'text/html' in mimetypes
        assert 'application/json' in mimetypes
        assert 'application/javascript' in mimetypes

    def test_rutas_registradas(self, app):
        rules = [rule.rule for rule in app.url_map.iter_rules()]
        assert '/' in rules
        assert '/api/apartados/crear' in rules
        assert '/api/apartados/eliminar' in rules
        assert '/api/apartados/listar' in rules
        assert '/api/apartados/editar' in rules
        assert '/api/apartados/restaurar' in rules
        assert '/api/apartados/eliminar-definitivo' in rules

    @patch('aplicacion.inicializarBaseDatos', side_effect=Exception('DB down'))
    def test_app_se_crea_aun_si_db_falla(self, mock_db):
        from aplicacion import crearAplicacion
        app = crearAplicacion()
        assert app is not None
