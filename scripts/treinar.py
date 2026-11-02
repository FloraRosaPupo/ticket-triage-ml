"""Experimento didático: ajuste no treino, previsão na validação."""

import csv
import hashlib
import json
from pathlib import Path
import platform
import warnings

import joblib
import sklearn
from sklearn.dummy import DummyClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.pipeline import Pipeline

from scripts.dividir_dados import conferir_divisao
from scripts.ler_dados import ler_dados

RAIZ = Path(__file__).resolve().parents[1]
CLASSES = ['acesso', 'cobranca', 'problema_tecnico']


def carregar_particoes(raiz=RAIZ):
    dados = raiz / 'data' / 'development.csv' # caminho para o arquivo de dados
    manifesto = raiz / 'data' / 'split_manifest.csv' # caminho para o arquivo de manifesto - lista de IDs e partições (treino, validação, teste)
    meta = json.loads((raiz / 'data' / 'split_metadata.json').read_text(encoding='utf-8'))
    for arquivo, campo in [(dados, 'source_sha256'), (manifesto, 'manifest_sha256')]:
        if hashlib.sha256(arquivo.read_bytes()).hexdigest() != meta[campo]:
            raise ValueError('Hash divergente: revisar os dados e o manifesto antes do treino.')
    registros = ler_dados(dados)
    with manifesto.open(encoding='utf-8', newline='') as arquivo:
        linhas = list(csv.DictReader(arquivo))
    partes = {r['id']: r['partition'] for r in linhas}
    if len(partes) != len(linhas): # se o número de IDs no manifesto for diferente do número de linhas no arquivo de dados, lança um erro
        raise ValueError('IDs repetidos no manifesto.')
    conferir_divisao(registros, partes)
    grupos = {r['id']: r['group_id'] for r in registros}
    if any(grupos[r['id']] != r['group_id'] for r in linhas):
        raise ValueError('Grupo do manifesto diferente dos dados.')
    return ([r for r in registros if partes[r['id']] == 'treino'],
            [r for r in registros if partes[r['id']] == 'validacao'], meta)


def ajustar(treino):
    textos = [r['text'] for r in treino]
    rotulos = [r['label'] for r in treino]
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer()),
        ('classificador', LogisticRegression(max_iter=1000, random_state=42)),
    ])
    pipeline.fit(textos, rotulos)
    baseline = DummyClassifier(strategy='most_frequent')
    baseline.fit(textos, rotulos)
    return pipeline, baseline


def main():
    treino, validacao, meta = carregar_particoes()
    with warnings.catch_warnings(record=True) as avisos:
        warnings.simplefilter('always')
        pipeline, baseline = ajustar(treino)
        textos = [r['text'] for r in validacao]
        reais = [r['label'] for r in validacao]
        resultados = {}
        for nome, modelo in [('baseline', baseline), ('pipeline', pipeline)]:
            previstas = modelo.predict(textos).tolist()
            resultados[nome] = {
                'metricas': classification_report(reais, previstas, labels=CLASSES, output_dict=True, zero_division=0),
                'matriz_confusao': confusion_matrix(reais, previstas, labels=CLASSES).tolist(),
                'previsoes': [{'id': r['id'], 'real': r['label'], 'prevista': p}
                             for r, p in zip(validacao, previstas)],
                'classes_sem_previsoes': sorted(set(CLASSES) - set(previstas)),
            }
    relatorio = {
        'status': 'experimento_didatico_revisao_humana_pendente',
        'teste_final': 'pendente_nao_acessado',
        'python': platform.python_version(), 'scikit_learn': sklearn.__version__,
        'script_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'split_metadata': meta, 'ordem_classes': CLASSES,
        'treino_ids': [r['id'] for r in treino],
        'configuracao': {'tfidf': 'defaults', 'logistic_regression': {'max_iter': 1000, 'random_state': 42}},
        'avisos': [str(a.message) for a in avisos],
        'limitacoes': 'Base sintética minúscula; seis exemplos de validação; métricas indefinidas recebem zero; não é teste final.',
        'resultados': resultados,
    }
    destino = RAIZ / 'reports' / 'validacao_inicial.json'
    destino.parent.mkdir(exist_ok=True)
    destino.write_text(json.dumps(relatorio, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    modelo_destino = RAIZ / 'models' / 'classificador.joblib'
    modelo_destino.parent.mkdir(exist_ok=True)
    joblib.dump(pipeline, modelo_destino)
    print(f'Treino: {len(treino)}; validacao: {len(validacao)}')
    for nome, resultado in resultados.items():
        acertos = sum(r['real'] == r['prevista'] for r in resultado['previsoes'])
        print(f'{nome}: {acertos}/{len(validacao)} acertos; macro-F1: {resultado["metricas"]["macro avg"]["f1-score"]:.3f}')
    print('Relatorio: reports/validacao_inicial.json')
    print('Modelo: models/classificador.joblib')


if __name__ == '__main__':
    main()
