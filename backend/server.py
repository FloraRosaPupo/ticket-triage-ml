"""API local da demonstração. Execute: python -m backend.server."""

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

import joblib

RAIZ = Path(__file__).resolve().parents[1]


def carregar_chamados(modelo):
    chamados = json.loads((RAIZ / 'data/demo_tickets.json').read_text(encoding='utf-8'))
    categorias = modelo.predict([chamado['text'] for chamado in chamados])
    return [dict(chamado, category=str(categoria))
            for chamado, categoria in zip(chamados, categorias)]


class Handler(BaseHTTPRequestHandler):
    modelo = None

    def responder(self, status, payload):
        conteudo = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(conteudo)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(conteudo)

    def do_GET(self):
        caminho = urlsplit(self.path).path
        if caminho == '/api/health':
            self.responder(200, {'status': 'ok', 'model_loaded': self.modelo is not None})
        elif caminho == '/api/tickets':
            try:
                self.responder(200, {'tickets': carregar_chamados(self.modelo)})
            except Exception:
                self.log_error('Falha ao carregar/classificar os chamados de demonstração.')
                self.responder(500, {'error': 'Não foi possível classificar os chamados.'})
        else:
            self.responder(404, {'error': 'Rota não encontrada.'})


def main():
    arquivo = RAIZ / 'models/classificador.joblib'
    if not arquivo.is_file():
        raise SystemExit('Modelo ausente. Execute: python -m scripts.treinar')
    Handler.modelo = joblib.load(arquivo)
    servidor = ThreadingHTTPServer(('127.0.0.1', 8000), Handler)
    print('API local: http://127.0.0.1:8000', flush=True)
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        servidor.server_close()


if __name__ == '__main__':
    main()
