"""Classifica um chamado usando a pipeline salva pelo treinamento."""

import argparse
from pathlib import Path

import joblib

MODELO = Path(__file__).resolve().parents[1] / 'models' / 'classificador.joblib'


def classificar(modelo, texto):
    texto = texto.strip()
    if not texto:
        raise ValueError('Digite um chamado que não esteja vazio.')
    if len(texto) > 2000:
        raise ValueError('O chamado deve ter no máximo 2.000 caracteres.')
    return str(modelo.predict([texto])[0])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('texto', nargs='?', help='Texto do chamado entre aspas.')
    args = parser.parse_args()
    if not MODELO.is_file():
        parser.exit(1, 'Modelo não encontrado. Execute: python -m scripts.treinar\n')
    try:
        texto = args.texto if args.texto is not None else input('Digite o chamado: ')
        # Carregar somente o artefato local produzido pelo nosso treinamento.
        modelo = joblib.load(MODELO)
        categoria = classificar(modelo, texto)
    except (ValueError, OSError, EOFError) as erro:
        parser.exit(1, f'Erro ao classificar: {erro}\n')
    print(f'Categoria prevista: {categoria}')
    print('Modelo didático: a previsão pode estar errada.')


if __name__ == '__main__':
    main()
