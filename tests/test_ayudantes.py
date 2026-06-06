import pytest
from aplicacion.ayudantes import normalizarNombreApartado


class TestNormalizarNombreApartado:

    def test_basic_string_uppercased(self):
        assert normalizarNombreApartado("direccion ip") == "DIRECCION_IP"

    def test_leading_trailing_spaces_stripped(self):
        assert normalizarNombreApartado("  mac address  ") == "MAC_ADDRESS"

    def test_accents_removed(self):
        assert normalizarNombreApartado("dirección") == "DIRECCION"

    def test_multiple_spaces_collapsed(self):
        assert normalizarNombreApartado("nombre   del   equipo") == "NOMBRE_DEL_EQUIPO"

    def test_already_uppercase(self):
        assert normalizarNombreApartado("IP") == "IP"

    def test_mixed_case(self):
        assert normalizarNombreApartado("Mac Address") == "MAC_ADDRESS"

    def test_special_characters_stripped(self):
        assert normalizarNombreApartado("señal") == "SENAL"

    def test_empty_string(self):
        assert normalizarNombreApartado("") == ""

    def test_only_spaces(self):
        assert normalizarNombreApartado("   ") == ""

    def test_tabs_and_newlines_replaced(self):
        assert normalizarNombreApartado("campo\ttabla") == "CAMPO_TABLA"

    def test_unicode_tilde_n(self):
        assert normalizarNombreApartado("año") == "ANO"

    def test_single_word(self):
        assert normalizarNombreApartado("gateway") == "GATEWAY"

    def test_numbers_preserved(self):
        assert normalizarNombreApartado("puerto 8080") == "PUERTO_8080"

    def test_hyphens_preserved(self):
        result = normalizarNombreApartado("sub-red")
        assert result == "SUB-RED"

    def test_underscores_preserved(self):
        assert normalizarNombreApartado("nombre_equipo") == "NOMBRE_EQUIPO"
