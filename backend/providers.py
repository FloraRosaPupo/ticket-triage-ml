"""Adapta a API pública de exemplos ao formato do nosso painel."""

import json
from urllib.request import Request, urlopen

URL = ('https://randomapi.dev/api/support-tickets?count=12&seed=42'
       '&from=2026-10-01&to=2026-11-01')
STATUS = {'new': 'novo', 'open': 'atendimento', 'pending': 'atendimento',
          'resolved': 'resolvido', 'closed': 'resolvido'}
PRIORIDADES = {'urgent': 'alta', 'high': 'alta', 'normal': 'media', 'low': 'baixa'}
CANAIS = {'email': 'E-mail', 'chat': 'Chat', 'web': 'Portal'}


def adaptar(payload):
    registros = payload.get('data')
    if not isinstance(registros, list) or len(registros) > 100:
        raise ValueError('Resposta inválida da API externa.')
    chamados = []
    ids = set()
    for item in registros:
        identificador = item['id']
        if not isinstance(identificador, str) or identificador in ids:
            raise ValueError('Identificador inválido ou repetido.')
        ids.add(identificador)
        mensagens = [m['text'] for m in item['messages'] if m['role'] == 'requester']
        texto = '\n\n'.join(mensagens)
        if not texto.strip():
            raise ValueError('Chamado sem mensagem do solicitante.')
        chamados.append({
            'id': identificador, 'title': item['subject'], 'text': texto,
            'customer': item['requester']['name'], 'company': 'Cliente fictício',
            'channel': CANAIS[item['channel']], 'priority': PRIORIDADES[item['priority']],
            'status': STATUS[item['status']], 'created_at': item['createdAt'],
            'category': 'revisao', 'source': 'randomapi', 'language': 'en',
            'classification_note': 'Esta mensagem está em inglês. A identificação automática de assuntos está disponível em português. Nenhum tema foi atribuído.',
        })
    return chamados


def carregar_externos():
    request = Request(URL, headers={'Accept': 'application/json', 'User-Agent': 'TicketTriageDemo/1.0'})
    with urlopen(request, timeout=15) as resposta:
        conteudo = resposta.read(2_000_001)
    if len(conteudo) > 2_000_000:
        raise ValueError('Resposta externa maior que o limite permitido.')
    return adaptar(json.loads(conteudo))
