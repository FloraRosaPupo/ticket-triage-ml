"""Separe apenas os dados de desenvolvimento por famílias de cenários."""

import csv
import hashlib
import json
from pathlib import Path

from scripts.ler_dados import CATEGORIAS, ler_dados

RAIZ = Path(__file__).resolve().parents[1]
SEMENTE = 42


def conferir_divisao(registros, particoes):
    if set(particoes) != {r['id'] for r in registros}:
        raise ValueError('O manifesto deve conter exatamente os IDs dos dados.')
    grupos = {}
    textos = {}
    classes = {'treino': set(), 'validacao': set()}
    for registro in registros:
        parte = particoes[registro['id']]
        if parte not in classes:
            raise ValueError('Partição inválida.')
        grupo = registro['group_id']
        texto = ' '.join(registro['text'].casefold().split())
        if grupo in grupos and grupos[grupo] != parte:
            raise ValueError('Grupo atravessa partições.')
        if texto in textos and textos[texto] != parte:
            raise ValueError('Texto duplicado atravessa partições.')
        grupos[grupo] = parte
        textos[texto] = parte
        classes[parte].add(registro['label'])
    if any(rotulos != CATEGORIAS for rotulos in classes.values()):
        raise ValueError('Cada partição deve conter as três categorias.')


def dividir(registros, semente=SEMENTE):
    grupos = {}
    textos = {}
    for registro in registros:
        grupo, rotulo = registro['group_id'], registro['label']
        if grupo in grupos and grupos[grupo] != rotulo:
            raise ValueError('Este divisor exige uma categoria por grupo; revisar o grupo.')
        grupos[grupo] = rotulo
        texto = ' '.join(registro['text'].casefold().split())
        if texto in textos and textos[texto] != (grupo, rotulo):
            raise ValueError('Texto duplicado em grupos ou categorias diferentes; revisar os dados.')
        textos[texto] = (grupo, rotulo)

    validacao = set()
    for categoria in sorted(CATEGORIAS):
        familias = [g for g, label in grupos.items() if label == categoria]
        if len(familias) < 2:
            raise ValueError('São necessários ao menos dois grupos por categoria.')
        # Ordenação determinística: a mesma semente e os mesmos grupos dão a mesma divisão.
        familias.sort(key=lambda g: hashlib.sha256(f'{semente}:{g}'.encode()).hexdigest())
        quantidade = max(1, len(familias) // 4)
        validacao.update(familias[:quantidade])

    particoes = {
        r['id']: 'validacao' if r['group_id'] in validacao else 'treino'
        for r in registros
    }
    conferir_divisao(registros, particoes)
    return particoes


def main():
    entrada = RAIZ / 'data' / 'development.csv'
    registros = ler_dados(entrada)
    particoes = dividir(registros)
    manifesto = RAIZ / 'data' / 'split_manifest.csv'
    with manifesto.open('w', encoding='utf-8', newline='') as arquivo:
        escritor = csv.DictWriter(arquivo, fieldnames=['id', 'group_id', 'partition'])
        escritor.writeheader()
        for registro in sorted(registros, key=lambda r: r['id']):
            escritor.writerow({'id': registro['id'], 'group_id': registro['group_id'],
                               'partition': particoes[registro['id']]})
    metadados = {
        'source': 'data/development.csv',
        'source_sha256': hashlib.sha256(entrada.read_bytes()).hexdigest(),
        'manifest_sha256': hashlib.sha256(manifesto.read_bytes()).hexdigest(),
        'seed': SEMENTE,
        'method': 'sha256(seed:group_id), sorted per class; max(1, groups // 4) for validation',
        'status': 'didactic_provisional_human_review_pending',
        'final_test': 'pending_not_created_or_read',
        'counts': {parte: list(particoes.values()).count(parte) for parte in ['treino', 'validacao']},
    }
    (RAIZ / 'data' / 'split_metadata.json').write_text(
        json.dumps(metadados, indent=2) + '\n', encoding='utf-8')
    print(metadados['counts'])
    print('Manifesto e metadados salvos. Nenhum modelo foi treinado.')


if __name__ == '__main__':
    main()
