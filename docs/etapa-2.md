# Etapa 2 — ambiente e leitura

Pré-requisito: Python instalado. Preparação feita com Python 3.13.2 no Windows.
Execute os comandos no PowerShell, na pasta `ticket-triage-ml`.

## Ambiente virtual

`python -m venv .venv` cria um ambiente isolado na pasta `.venv`.
Execute uma vez ao preparar o projeto em um computador. O `.gitignore` exclui
essa pasta do versionamento. Esta etapa usa a biblioteca padrão do Python;
não requer baixar pandas, scikit-learn ou outras bibliotecas externas.

Não precisamos ativar o ambiente: usamos seu executável diretamente.

```powershell
.\.venv\Scripts\python.exe -c "import sys; print(sys.executable)"
.\.venv\Scripts\python.exe -m pip --version
```

Os caminhos exibidos devem apontar para `.venv` deste projeto.

## Leitura

```powershell
.\.venv\Scripts\python.exe scripts\ler_dados.py
```

O script lê `data/exemplos_estudo.csv`, valida e mostra três chamados.
Não altera dados nem treina modelo. CSV é uma tabela em texto: a primeira linha
contém os nomes das colunas e cada linha seguinte contém um exemplo.

| Coluna | Papel |
|---|---|
| id | Identificador único |
| text | Texto do chamado |
| label | Categoria atribuída |
| origem | Procedência: sintetico_estudo |
| group_id | Família de cenário; paráfrases devem compartilhar o grupo |

Os três exemplos são fictícios, criados para estudo, e não pertencem ao teste
final reservado. Não são suficientes para treinar e avaliar um modelo útil.

O script verifica cabeçalho, campos preenchidos, IDs únicos, categoria permitida,
limite de 2.000 caracteres e tabela não vazia. Ele não confirma que o rótulo faz
sentido, não detecta paráfrases e não verifica a veracidade da origem.

## Observar uma falha

```powershell
.\.venv\Scripts\python.exe scripts\ler_dados.py data\arquivo_inexistente.csv
```

Resultado esperado: `Erro ao ler dados` e código de saída 1. Nenhum arquivo é criado.
Esse teste verifica tratamento de arquivo ausente, não a qualidade de um modelo.

Antes de avançar, explique o papel da `.venv`, de uma linha do CSV e da validação.
