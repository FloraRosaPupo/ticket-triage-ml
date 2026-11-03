# ticket-triage-ml

## Etapa atual

Classificador didático de chamados em `acesso`, `cobranca` e `problema_tecnico`,
usando TF-IDF e regressão logística. A base contém 24 exemplos sintéticos:
18 para treino e 6 para validação, separados por grupos de cenários.
A revisão humana completa e o teste final permanecem pendentes.

## Executar no PowerShell

Na raiz do projeto, com Python instalado:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
.\.venv\Scripts\python.exe -m scripts.treinar
.\.venv\Scripts\python.exe -m scripts.classificar
```

Crie a `.venv` apenas na preparação inicial. O último comando pede um chamado
para classificar. Também é possível informar o texto diretamente:

```powershell
.\.venv\Scripts\python.exe -m scripts.classificar "Esqueci minha senha"
```

O treinamento salva a pipeline completa em `models/classificador.joblib` e
atualiza `reports/validacao_inicial.json`. O classificador carrega essa pipeline
sem treinar novamente. A pasta `models` não é versionada: gere o modelo localmente.
Carregue apenas artefatos joblib de origem confiável, pois esse formato pode
executar código durante a leitura. Use o mesmo ambiente de dependências do treino.

O primeiro experimento acertou 3 de 6 chamados de validação, contra 2 de 6
do baseline. A base pequena e sintética não demonstra desempenho real.

## Painel de suporte em React

O painel usa React + Parcel e carrega 12 chamados fictícios da RandomAPI pela
API Python. As mensagens em inglês são traduzidas pelo MyMemory antes de
receberem temas sugeridos pelo classificador. Os detalhes preservam o original
e mostram a tradução. O seletor permite usar nove exemplos em português, que
começam aguardando revisão e são classificados pelo botão “Identificar assuntos”.
“Voltar para antes da classificação” remove as sugestões da tela e mantém os
status de atendimento. A tradução gratuita depende de internet e de uma cota diária;
em caso de falha, o chamado permanece aguardando revisão com uma explicação.
Falhas na fonte externa são mostradas na tela, sem substituir os dados silenciosamente.
Há busca, filtros por tema,
Kanban agrupado por tema, detalhes e mudança de status na sessão.

Na raiz do projeto, com o modelo treinado, inicie a API:

```powershell
.\.venv\Scripts\python.exe -m backend.server
```

Em outro terminal:

```powershell
cd frontend
npm install
npm run dev
```

Abra http://127.0.0.1:1234. Mudanças de status não são persistidas após recarregar
a página. Os dados de demonstração são separados dos dados de treino e não
servem para avaliar desempenho. Veja [a explicação dos componentes](docs/painel-react.md).

## Guias de estudo

- [Ambiente e leitura dos dados](docs/etapa-2.md)
- [Dados, categorias e divisão](docs/dados.md)
- [Primeiro treinamento](docs/primeiro-treino.md)
- [Fluxogramas do processo](docs/fluxograma.md)
- [Painel React passo a passo](docs/painel-react.md)
