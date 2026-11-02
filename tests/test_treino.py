import unittest
from unittest.mock import patch

from scripts.treinar import ajustar


class TestTreino(unittest.TestCase):
    def test_fit_recebe_apenas_textos_e_rotulos_do_treino(self):
        treino = [{'text': 'texto permitido', 'label': 'acesso', 'id': 'nao_usar'}]
        with patch('scripts.treinar.Pipeline') as pipeline, patch('scripts.treinar.DummyClassifier') as baseline:
            ajustar(treino)
        pipeline.return_value.fit.assert_called_once_with(['texto permitido'], ['acesso'])
        baseline.return_value.fit.assert_called_once_with(['texto permitido'], ['acesso'])

    def test_vocabulario_nao_aprende_com_previsao(self):
        treino = [
            {'text': 'senha acesso', 'label': 'acesso'},
            {'text': 'fatura pagamento', 'label': 'cobranca'},
            {'text': 'travamento tela', 'label': 'problema_tecnico'},
        ]
        modelo, baseline = ajustar(treino)
        vetor = modelo.named_steps['tfidf']
        antes = dict(vetor.vocabulary_)
        idf = vetor.idf_.copy()
        previsoes = modelo.predict(['palavraexclusivadavalidacao senha'])
        self.assertNotIn('palavraexclusivadavalidacao', vetor.vocabulary_)
        self.assertEqual(antes, vetor.vocabulary_)
        self.assertTrue((idf == vetor.idf_).all())
        self.assertEqual(len(previsoes), 1)
        self.assertEqual(len(baseline.predict(['novo texto'])), 1)


if __name__ == '__main__':
    unittest.main()
