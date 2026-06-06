import sys
import pytest
from unittest.mock import patch


@pytest.fixture(scope='session')
def app():
    with patch('aplicacion.inicializarBaseDatos'):
        from aplicacion import crearAplicacion
        aplicacion = crearAplicacion()
    aplicacion.config['TESTING'] = True
    return aplicacion


@pytest.fixture
def client(app):
    return app.test_client()
