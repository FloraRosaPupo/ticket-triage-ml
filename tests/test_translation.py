import unittest
from unittest.mock import Mock, patch

from backend.translation import classificar_externos
from backend.server import carregar_chamados


class TestTranslation(unittest.TestCase):
    def test_classifica_traducao_e_preserva_original(self):
        modelo = Mock()
        modelo.predict.return_value = ['acesso']
        ticket = {'title': 'Password', 'text': 'Forgot password', 'category': 'revisao'}
        with patch('backend.translation.traduzir', side_effect=lambda t: {'Password': 'Senha', 'Forgot password': 'Esqueci a senha'}[t]):
            resultado = classificar_externos([ticket], modelo)[0]
        modelo.predict.assert_called_once_with(['Senha\n\nEsqueci a senha'])
        self.assertEqual(resultado['text'], 'Forgot password')
        self.assertEqual(resultado['category'], 'acesso')

    def test_falha_de_traducao_nao_inventa_tema(self):
        modelo = Mock()
        with patch('backend.translation.traduzir', side_effect=ValueError('limite')):
            resultado = classificar_externos([{'title': 'Help', 'text': 'Help', 'category': 'revisao'}], modelo)
        modelo.predict.assert_not_called()
        self.assertEqual(resultado[0]['category'], 'revisao')

    def test_portugues_aguarda_acao_para_classificar(self):
        modelo = Mock()
        chamados = carregar_chamados(modelo)
        self.assertTrue(all(t['category'] == 'revisao' for t in chamados))
        modelo.predict.assert_not_called()
