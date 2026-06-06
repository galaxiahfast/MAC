import pytest
from unittest.mock import patch, MagicMock


class TestIndex:

    def test_index_returns_200(self, client):
        response = client.get('/')
        assert response.status_code == 200


class TestCrearApartado:

    @patch('aplicacion.peticiones.crearApartado')
    def test_crear_apartado_exitoso(self, mock_crear, client):
        response = client.post(
            '/api/apartados/crear',
            json={'nombreApartado': 'dirección ip', 'valorPredeterminado': '0.0.0.0'}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data['estado'] == 'exito'
        mock_crear.assert_called_once_with('DIRECCION_IP', '0.0.0.0')

    def test_crear_apartado_sin_nombre_retorna_400(self, client):
        response = client.post(
            '/api/apartados/crear',
            json={'nombreApartado': '', 'valorPredeterminado': 'test'}
        )
        assert response.status_code == 400
        data = response.get_json()
        assert data['estado'] == 'error'
        assert 'Nombre obligatorio' in data['mensaje']

    def test_crear_apartado_sin_body_retorna_400(self, client):
        response = client.post(
            '/api/apartados/crear',
            json={}
        )
        assert response.status_code == 400

    @patch('aplicacion.peticiones.crearApartado', side_effect=Exception('DB error'))
    def test_crear_apartado_error_interno(self, mock_crear, client):
        response = client.post(
            '/api/apartados/crear',
            json={'nombreApartado': 'test', 'valorPredeterminado': ''}
        )
        assert response.status_code == 500
        data = response.get_json()
        assert data['estado'] == 'error'
        assert 'DB error' in data['mensaje']


class TestEliminarApartado:

    @patch('aplicacion.peticiones.eliminarApartado')
    def test_eliminar_apartado_exitoso(self, mock_eliminar, client):
        response = client.post(
            '/api/apartados/eliminar',
            json={'nombreApartado': 'IP'}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data['estado'] == 'exito'

    def test_eliminar_apartado_sin_nombre_retorna_400(self, client):
        response = client.post(
            '/api/apartados/eliminar',
            json={'nombreApartado': ''}
        )
        assert response.status_code == 400

    @patch('aplicacion.peticiones.eliminarApartado', side_effect=ValueError('No existe'))
    def test_eliminar_apartado_no_existente(self, mock_eliminar, client):
        response = client.post(
            '/api/apartados/eliminar',
            json={'nombreApartado': 'INEXISTENTE'}
        )
        assert response.status_code == 500
        data = response.get_json()
        assert data['estado'] == 'error'


class TestListarApartados:

    @patch('aplicacion.peticiones.listarApartados', return_value=[
        {'id': 1, 'nombreApartado': 'IP', 'valorPredeterminado': '0.0.0.0'}
    ])
    def test_listar_apartados_exitoso(self, mock_listar, client):
        response = client.get('/api/apartados/listar')
        assert response.status_code == 200
        data = response.get_json()
        assert data['estado'] == 'exito'
        assert len(data['apartados']) == 1
        assert data['apartados'][0]['nombreApartado'] == 'IP'

    @patch('aplicacion.peticiones.listarApartados', return_value=[])
    def test_listar_apartados_vacio(self, mock_listar, client):
        response = client.get('/api/apartados/listar')
        assert response.status_code == 200
        data = response.get_json()
        assert data['apartados'] == []

    @patch('aplicacion.peticiones.listarApartados', side_effect=Exception('DB down'))
    def test_listar_apartados_error(self, mock_listar, client):
        response = client.get('/api/apartados/listar')
        assert response.status_code == 500


class TestEditarApartado:

    @patch('aplicacion.peticiones.editarApartado')
    def test_editar_apartado_exitoso(self, mock_editar, client):
        response = client.post(
            '/api/apartados/editar',
            json={
                'idApartado': 1,
                'nombreApartado': 'MAC',
                'valorPredeterminado': '00:00:00:00:00:00'
            }
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data['estado'] == 'exito'

    def test_editar_apartado_sin_id_retorna_400(self, client):
        response = client.post(
            '/api/apartados/editar',
            json={'nombreApartado': 'test', 'valorPredeterminado': 'val'}
        )
        assert response.status_code == 400

    @patch('aplicacion.peticiones.editarApartado', side_effect=Exception('DB error'))
    def test_editar_apartado_error_interno(self, mock_editar, client):
        response = client.post(
            '/api/apartados/editar',
            json={'idApartado': 1, 'nombreApartado': 'X', 'valorPredeterminado': 'Y'}
        )
        assert response.status_code == 500


class TestRestaurarApartado:

    @patch('aplicacion.peticiones.restaurarApartado')
    def test_restaurar_apartado_exitoso(self, mock_restaurar, client):
        response = client.post(
            '/api/apartados/restaurar',
            json={'nombreApartado': 'IP'}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data['estado'] == 'exito'
        assert 'restaurado' in data['mensaje'].lower()

    def test_restaurar_apartado_sin_nombre_retorna_400(self, client):
        response = client.post(
            '/api/apartados/restaurar',
            json={'nombreApartado': ''}
        )
        assert response.status_code == 400

    @patch('aplicacion.peticiones.restaurarApartado', side_effect=ValueError('No existe'))
    def test_restaurar_apartado_no_existente(self, mock_restaurar, client):
        response = client.post(
            '/api/apartados/restaurar',
            json={'nombreApartado': 'INEXISTENTE'}
        )
        assert response.status_code == 500


class TestEliminarApartadoDefinitivo:

    @patch('aplicacion.peticiones.eliminarApartadoDefinitivo')
    def test_eliminar_definitivo_exitoso(self, mock_eliminar, client):
        response = client.post(
            '/api/apartados/eliminar-definitivo',
            json={'nombreApartado': 'IP'}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data['estado'] == 'exito'
        assert 'definitivamente' in data['mensaje'].lower()

    def test_eliminar_definitivo_sin_nombre_retorna_400(self, client):
        response = client.post(
            '/api/apartados/eliminar-definitivo',
            json={'nombreApartado': ''}
        )
        assert response.status_code == 400

    @patch('aplicacion.peticiones.eliminarApartadoDefinitivo', side_effect=ValueError('No existe'))
    def test_eliminar_definitivo_error(self, mock_eliminar, client):
        response = client.post(
            '/api/apartados/eliminar-definitivo',
            json={'nombreApartado': 'INEXISTENTE'}
        )
        assert response.status_code == 500
