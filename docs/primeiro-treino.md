# Primeiro treino didático

IA foi usada no desenvolvimento: o assistente sugeriu os exemplos e rótulos,
escreveu scripts e executou verificações. A revisão humana completa dos exemplos
permanece pendente. Os scripts de leitura e divisão executam regras explícitas;
o classificador aprende parâmetros dos dados. Não há chamada a LLM no treino.

## Execução

No PowerShell, na raiz `ticket-triage-ml`, usando a `.venv` da etapa 2:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
.\.venv\Scripts\python.exe -m scripts.treinar
```

A instalação baixa bibliotecas para a `.venv`. Os testes usam dados fictícios
de software. O treino confere os hashes dos dados e do manifesto e a separação
dos grupos antes de ajustar o modelo. Se um hash divergir, revisar a mudança;
não regenerar o manifesto apenas para esconder o erro.

`ajustar(treino)` recebe somente os 18 exemplos de treino. A pipeline contém:

1. TF-IDF: aprende o vocabulário e os pesos IDF do treino.
2. Regressão logística: aprende a associar esses números aos rótulos.

Usamos uma configuração inicial fixa, sem busca por melhores pontuações.
Na validação, `predict` recebe os seis textos sem os rótulos. Os rótulos são
usados depois para conferir as previsões. IDs, origem e grupos não são entradas
do modelo. O teste final não é aberto nem criado por esse script.

O baseline é uma regra de comparação: sempre prever a categoria mais frequente
do treino. Neste lote há empate; o DummyClassifier escolhe a primeira classe
na ordem usada internamente. A comparação usa os mesmos seis exemplos.

## Saída

Primeira execução: scikit-learn 1.9.1; seis testes de software passaram.
O baseline acertou 2 de 6 (macro-F1 0,167), e a pipeline acertou 3 de 6
(macro-F1 0,522). Nenhum ajuste foi feito para melhorar essa pontuação.

`reports/validacao_inicial.json` é criado ou substituído a cada execução.
Registra previsões por ID, métricas, matriz de confusão, versões, configuração,
hash do script e identificação dos dados. A pipeline completa (TF-IDF e
classificador) é salva em `models/classificador.joblib`. Cada execução substitui
esse arquivo. Depois, execute `python -m scripts.classificar` usando a Python
da `.venv` para digitar um novo chamado e receber uma previsão sem novo treino.

Macro-F1 resume a média do F1 das três categorias. Estudaremos essa medida na
etapa de avaliação. Métricas indefinidas recebem zero e categorias sem previsão
ficam registradas. A matriz usa linhas reais e colunas previstas, na ordem
acesso, cobranca, problema_tecnico.

A base pequena e sintética, com somente três grupos na validação, não comprova
desempenho real. O resultado é provisório e não constitui avaliação final.

Referências oficiais consultadas:
- https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html
- https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html
