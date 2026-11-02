import tempfile
import unittest
from pathlib import Path

import joblib

from scripts.classificar import classificar
from scripts.treinar import ajustar


class TestClassificar(unittest.TestCase):
    def test_modelo_salvo_preserva_previsao_e_vocabulario(self):
        modelo, _ = ajustar([
            {'text': 'senha acesso', 'label': 'acesso'},
            {'text': 'fatura pagamento', 'label': 'cobranca'},
            {'text': 'travamento tela', 'label': 'problema_tecnico'},
        ])
        with tempfile.TemporaryDirectory() as pasta:
            arquivo = Path(pasta) / 'modelo.joblib'
            joblib.dump(modelo, arquivo)
            carregado = joblib.load(arquivo)
        self.assertEqual(classificar(modelo, 'senha'), classificar(carregado, 'senha'))
        self.assertEqual(modelo.named_steps['tfidf'].vocabulary_,
                         carregado.named_steps['tfidf'].vocabulary_)

    def test_rejeita_texto_vazio_ou_longo_antes_da_previsao(self):
        for texto in ['', '   ', 'a' * 2001]:
            with self.subTest(texto=texto), self.assertRaises(ValueError):
                classificar(None, texto)


if __name__ == '__main__':
    unittest.main()
