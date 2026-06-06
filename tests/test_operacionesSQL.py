import pytest
from unittest.mock import patch, MagicMock, call
from aplicacion.baseDatos.operacionesSQL import (
    listarApartados,
    crearApartado,
    eliminarApartado,
    editarApartado,
    restaurarApartado,
    eliminarApartadoDefinitivo,
    vincularApartadoADispositivos,
)


class TestListarApartados:

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_retorna_lista_apartados(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchall.return_value = [
            {'id': 1, 'nombreApartado': 'IP', 'valorPredeterminado': '0.0.0.0', 'fechaCreacion': '2026-01-01'}
        ]
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        resultado = listarApartados()

        assert len(resultado) == 1
        assert resultado[0]['nombreApartado'] == 'IP'
        mock_cur.execute.assert_called_once()
        mock_cur.close.assert_called_once()
        mock_conn.close.assert_called_once()

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_retorna_lista_vacia(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchall.return_value = []
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        resultado = listarApartados()
        assert resultado == []

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_cierra_recursos_en_excepcion(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.execute.side_effect = Exception('SQL error')
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        with pytest.raises(Exception, match='SQL error'):
            listarApartados()

        mock_cur.close.assert_called_once()
        mock_conn.close.assert_called_once()


class TestCrearApartado:

    @patch('aplicacion.baseDatos.operacionesSQL.threading')
    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_crea_apartado_exitosamente(self, mock_obtener, mock_threading):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = None
        mock_cur.lastrowid = 42
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        crearApartado('IP', '0.0.0.0')

        assert mock_cur.execute.call_count == 2
        mock_conn.commit.assert_called_once()
        mock_threading.Thread.assert_called_once()

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_lanza_error_si_apartado_ya_existe(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = {'id': 1}
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        with pytest.raises(ValueError, match="ya existe"):
            crearApartado('IP', '0.0.0.0')

        mock_conn.rollback.assert_called_once()

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_rollback_en_excepcion_sql(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = None
        mock_cur.execute.side_effect = [None, Exception('INSERT failed')]
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        with pytest.raises(Exception, match='INSERT failed'):
            crearApartado('IP', '0.0.0.0')

        mock_conn.rollback.assert_called_once()


class TestEliminarApartado:

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_elimina_apartado_exitosamente(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = {'id': 5}
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        eliminarApartado('IP')

        assert mock_cur.execute.call_count == 2
        mock_conn.commit.assert_called_once()

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_lanza_error_si_no_existe(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = None
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        with pytest.raises(ValueError, match="no existe"):
            eliminarApartado('INEXISTENTE')

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_rollback_en_error(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = {'id': 5}
        mock_cur.execute.side_effect = [None, Exception('SQL fail')]
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        with pytest.raises(Exception):
            eliminarApartado('IP')

        mock_conn.rollback.assert_called_once()


class TestEditarApartado:

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_editar_apartado_exitosamente(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        editarApartado(1, 'MAC_ADDRESS', '00:00:00:00:00:00')

        assert mock_cur.execute.call_count == 2
        mock_conn.commit.assert_called_once()

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_rollback_en_error(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.execute.side_effect = Exception('Update failed')
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        with pytest.raises(Exception, match='Update failed'):
            editarApartado(1, 'X', 'Y')

        mock_conn.rollback.assert_called_once()


class TestRestaurarApartado:

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_restaurar_apartado_exitosamente(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = {'id': 3, 'valorPredeterminado': '0.0.0.0'}
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        restaurarApartado('IP')

        assert mock_cur.execute.call_count == 3
        mock_conn.commit.assert_called_once()

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_lanza_error_si_no_existe(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = None
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        with pytest.raises(ValueError, match="no existe"):
            restaurarApartado('INEXISTENTE')

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_rollback_en_error(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = {'id': 3, 'valorPredeterminado': 'val'}
        mock_cur.execute.side_effect = [None, Exception('fail')]
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        with pytest.raises(Exception):
            restaurarApartado('IP')

        mock_conn.rollback.assert_called_once()


class TestEliminarApartadoDefinitivo:

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_eliminar_definitivo_exitosamente(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = {'id': 7}
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        eliminarApartadoDefinitivo('IP')

        assert mock_cur.execute.call_count == 3
        mock_conn.commit.assert_called_once()

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_lanza_error_si_no_existe(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = None
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        with pytest.raises(ValueError, match="no existe"):
            eliminarApartadoDefinitivo('INEXISTENTE')

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_rollback_en_error(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = {'id': 7}
        mock_cur.execute.side_effect = [None, Exception('DELETE failed')]
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        with pytest.raises(Exception):
            eliminarApartadoDefinitivo('IP')

        mock_conn.rollback.assert_called_once()


class TestStubFunctions:
    """Tests for placeholder device operation stubs."""

    def test_listar_dispositivos_retorna_none(self):
        from aplicacion.baseDatos.operacionesSQL import listarDispositivos
        assert listarDispositivos() is None

    def test_crear_dispositivo_retorna_none(self):
        from aplicacion.baseDatos.operacionesSQL import crearDispositivo
        assert crearDispositivo() is None

    def test_mover_dispositivo_retorna_none(self):
        from aplicacion.baseDatos.operacionesSQL import moverDispositivo
        assert moverDispositivo() is None

    def test_ocultar_dispositivo_retorna_none(self):
        from aplicacion.baseDatos.operacionesSQL import ocultarDispositivo
        assert ocultarDispositivo() is None

    def test_eliminar_dispositivo_retorna_none(self):
        from aplicacion.baseDatos.operacionesSQL import eliminarDispositivo
        assert eliminarDispositivo() is None

    def test_obtener_detalles_dispositivo_retorna_none(self):
        from aplicacion.baseDatos.operacionesSQL import obtenerDetallesDispositivo
        assert obtenerDetallesDispositivo() is None


class TestVincularApartadoADispositivos:

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_vincula_dispositivos_exitosamente(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchall.return_value = [(1,), (2,), (3,)]
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        vincularApartadoADispositivos(42, '0.0.0.0')

        mock_cur.executemany.assert_called_once()
        mock_conn.commit.assert_called_once()

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_no_inserta_si_no_hay_dispositivos(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchall.return_value = []
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        vincularApartadoADispositivos(42, '0.0.0.0')

        mock_cur.executemany.assert_not_called()

    @patch('aplicacion.baseDatos.operacionesSQL.obtenerConexion')
    def test_maneja_error_sin_propagar(self, mock_obtener):
        mock_conn = MagicMock()
        mock_conn.is_connected.return_value = True
        mock_cur = MagicMock()
        mock_cur.fetchall.side_effect = Exception('Connection lost')
        mock_conn.cursor.return_value = mock_cur
        mock_obtener.return_value = mock_conn

        # Should not raise - errors are caught internally
        vincularApartadoADispositivos(42, '0.0.0.0')
