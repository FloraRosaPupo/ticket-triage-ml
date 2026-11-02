import unittest

from scripts.dividir_dados import conferir_divisao, dividir


def exemplos():
    return [
        {'id': f'{classe}_{grupo}_{variacao}', 'label': classe,
         'group_id': f'{classe}_{grupo}', 'text': f'{classe} cenário {grupo} variante {variacao}'}
        for classe in ['acesso', 'cobranca', 'problema_tecnico']
        for grupo in range(4) for variacao in range(2)
    ]


class TestDivisao(unittest.TestCase):
    def test_divisao_preserva_grupos_classes_e_reproduz(self):
        dados = exemplos()
        partes = dividir(dados)
        self.assertEqual(partes, dividir(list(reversed(dados))))
        self.assertEqual(list(partes.values()).count('treino'), 18)
        self.assertEqual(list(partes.values()).count('validacao'), 6)
        conferir_divisao(dados, partes)

    def test_rejeita_grupo_atravessando_particoes(self):
        dados = exemplos()
        partes = dividir(dados)
        partes[dados[0]['id']] = 'treino'
        partes[dados[1]['id']] = 'validacao'
        with self.assertRaisesRegex(ValueError, 'Grupo atravessa'):
            conferir_divisao(dados, partes)

    def test_rejeita_duplicata_em_outro_grupo(self):
        dados = exemplos()
        dados[2]['text'] = dados[0]['text']
        with self.assertRaisesRegex(ValueError, 'Texto duplicado'):
            dividir(dados)

    def test_rejeita_classe_sem_grupos_suficientes(self):
        dados = [r for r in exemplos() if r['label'] != 'acesso']
        with self.assertRaisesRegex(ValueError, 'dois grupos'):
            dividir(dados)


if __name__ == '__main__':
    unittest.main()
