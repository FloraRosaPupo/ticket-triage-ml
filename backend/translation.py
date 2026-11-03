"""Tradução dos exemplos públicos antes da classificação em português."""

from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from html import unescape
import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen


@lru_cache(maxsize=512)
def traduzir(texto):
    if len(texto.encode('utf-8')) > 500:
        raise ValueError('Trecho acima do limite de tradução.')
    url = 'https://api.mymemory.translated.net/get?' + urlencode({'q': texto, 'langpair': 'en|pt-BR'})
    with urlopen(Request(url, headers={'User-Agent': 'TicketTriageDemo/1.0'}), timeout=12) as resposta:
        payload = json.loads(resposta.read(200_000))
    traducao = payload.get('responseData', {}).get('translatedText')
    if str(payload.get('responseStatus')) != '200' or payload.get('quotaFinished') or not isinstance(traducao, str) or not traducao.strip():
        raise ValueError('Tradução indisponível ou limite gratuito atingido.')
    return unescape(traducao)


def classificar_externos(chamados, modelo):
    # Traduzir uma vez cada trecho único reduz chamadas e uso da cota gratuita.
    trechos = {trecho for chamado in chamados for trecho in [chamado['title'], *chamado['text'].split('\n\n')]}
    def tentar(trecho):
        try:
            return trecho, traduzir(trecho)
        except Exception:
            return trecho, None
    with ThreadPoolExecutor(max_workers=3) as pool:
        traducoes = dict(pool.map(tentar, sorted(trechos)))
    resultado = []
    for chamado in chamados:
        partes = [chamado['title'], *chamado['text'].split('\n\n')]
        if any(traducoes[p] is None for p in partes):
            resultado.append(dict(chamado, classification_note='Não foi possível traduzir esta mensagem agora. Tente identificar os assuntos novamente.'))
            continue
        texto = '\n\n'.join(traducoes[p] for p in partes)
        categoria = str(modelo.predict([texto])[0])
        resultado.append(dict(chamado, category=categoria, translated_text=texto,
                              classification_note='Tema sugerido a partir da tradução para português. Confira a mensagem: exemplos genéricos podem receber sugestões incorretas.'))
    return resultado
