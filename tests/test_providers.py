import unittest

from backend.providers import adaptar


class TestProvider(unittest.TestCase):
    def registro(self):
        return {'id': 'tkt_1', 'subject': 'Example issue', 'requester': {'name': 'Example'},
                'messages': [{'role': 'requester', 'text': 'My account is locked'},
                             {'role': 'agent', 'text': 'Internal response'}],
                'status': 'pending', 'priority': 'urgent', 'channel': 'web',
                'createdAt': '2026-10-01T10:00:00Z'}

    def test_adapta_sem_inventar_categoria_ou_incluir_fala_do_agente(self):
        ticket = adaptar({'data': [self.registro()]})[0]
        self.assertEqual(ticket['text'], 'My account is locked')
        self.assertEqual(ticket['category'], 'revisao')
        self.assertEqual(ticket['status'], 'atendimento')
        self.assertEqual(ticket['priority'], 'alta')

    def test_rejeita_duplicatas_e_resposta_invalida(self):
        for payload in ({}, {'data': None}, {'data': [self.registro(), self.registro()]}):
            with self.assertRaises(ValueError):
                adaptar(payload)

    def test_lista_vazia(self):
        self.assertEqual(adaptar({'data': []}), [])
