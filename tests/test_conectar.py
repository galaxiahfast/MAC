import pytest
from unittest.mock import patch, MagicMock
from aplicacion.baseDatos.conectar import (
    obtenerConexion,
    inicializarBaseDatos,
    configuracionBaseDatos,
)


class TestConfiguracionBaseDatos:

    def test_host_es_localhost(self):
        assert configuracionBaseDatos['host'] == 'localhost'

    def test_puerto_es_3306(self):
        assert configuracionBaseDatos['port'] == 3306

    def test_charset_es_utf8mb4(self):
        assert configuracionBaseDatos['charset'] == 'utf8mb4'

    def test_autocommit_desactivado(self):
        assert configuracionBaseDatos['autocommit'] is False

    def test_timeout_es_5(self):
        assert configuracionBaseDatos['connection_timeout'] == 5

    def test_database_name(self):
        assert configuracionBaseDatos['database'] == 'mapa_dispositivos'


class TestObtenerConexion:

    @patch('aplicacion.baseDatos.conectar.mysql.connector.connect')
    def test_retorna_conexion(self, mock_connect):
        mock_conn = MagicMock()
        mock_connect.return_value = mock_conn

        resultado = obtenerConexion()

        assert resultado == mock_conn
        mock_connect.assert_called_once_with(**configuracionBaseDatos)

    @patch('aplicacion.baseDatos.conectar.mysql.connector.connect')
    def test_propaga_error_de_conexion(self, mock_connect):
        mock_connect.side_effect = Exception('Connection refused')

        with pytest.raises(Exception, match='Connection refused'):
            obtenerConexion()


class TestInicializarBaseDatos:

    @patch('aplicacion.baseDatos.conectar.obtenerConexion')
    def test_inicializa_exitosamente(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_obtener.return_value = mock_conn

        inicializarBaseDatos()

        mock_conn.close.assert_called_once()

    @patch('aplicacion.baseDatos.conectar.obtenerConexion')
    def test_propaga_error_y_cierra_conexion(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_obtener.side_effect = Exception('Timeout')

        with pytest.raises(Exception, match='Timeout'):
            inicializarBaseDatos()

    @patch('aplicacion.baseDatos.conectar.obtenerConexion')
    def test_no_cierra_si_conexion_no_establecida(self, mock_obtener):
        mock_obtener.side_effect = Exception('Failed')

        with pytest.raises(Exception):
            inicializarBaseDatos()

    @patch('aplicacion.baseDatos.conectar.obtenerConexion')
    def test_imprime_error_mysql_y_relanza(self, mock_obtener, capsys):
        from mysql.connector import Error
        mock_obtener.side_effect = Error('Connection refused')

        with pytest.raises(Error, match='Connection refused'):
            inicializarBaseDatos()

        captured = capsys.readouterr()
        assert '[MYSQL] Error de conexión' in captured.out
