# Dados de desenvolvimento — versão inicial

## Origem e finalidade

`data/development.csv` contém 24 exemplos fictícios sugeridos por IA nesta etapa
de tutoria. Não foram coletados de clientes nem copiados de uma base externa.
Não houve anonimização: os textos foram criados como exemplos sintéticos, sem
identificadores pessoais reais. A revisão humana por Flora está pendente.

Objetivo: aprender a organizar dados antes de treinar um classificador.
Este lote pequeno e artificial não demonstra desempenho em atendimento real.

## Regras de rótulo

- `acesso`: senha, autenticação, conta bloqueada ou permissão negada.
  Permissão negada continua sendo acesso mesmo após conseguir fazer login.
- `cobranca`: valor cobrado, duplicidade, reconhecimento de pagamento e estorno.
- `problema_tecnico`: falha de funcionamento de um recurso acessível, como
  travamento, encerramento inesperado ou alterações que não são salvas.

A intenção do chamado determina o rótulo, não uma palavra isolada.
Uma falha técnica na tela de pagamento, por exemplo, não é automaticamente cobrança.
Mensagens com duas solicitações independentes ou contexto insuficiente devem
ser discutidas separadamente, sem forçar um rótulo neste lote.

## Grupos e contagens

| Categoria | Grupos | Exemplos |
|---|---:|---:|
| acesso | 4 | 8 |
| cobranca | 4 | 8 |
| problema_tecnico | 4 | 8 |
| Total | 12 | 24 |

Cada par consecutivo de IDs representa uma família de cenário e compartilha
`group_id`. As duas linhas de uma família devem permanecer na mesma partição.
Ter 24 textos não significa ter 24 cenários independentes.

Os exemplos de `data/exemplos_estudo.csv` continuam sendo material da etapa 2.
Alguns cenários foram reaproveitados aqui com os mesmos grupos: não concatenar
os dois arquivos como se fossem bases independentes nem usar o arquivo antigo
como teste final.

## Revisão antes da divisão

Conferir se cada texto sustenta seu rótulo e se famílias próximas precisam ser
unificadas. Atenção ao par dev_007/dev_008: trata de permissão para relatórios,
enquanto dev_017/dev_018 trata de travamento da exportação já acessível.
Os dois cenários foram separados pela causa descrita; revisar essa fronteira.

Duplicatas literais podem ser verificadas por código. Ausência de duplicatas
literais não comprova ausência de paráfrases ou de exemplos muito parecidos.
Nenhuma duplicata foi removida nesta preparação inicial.

## Partições e próximos passos

Este arquivo é destinado somente ao desenvolvimento. Foi criada uma divisão
didática provisória: 18 exemplos (9 grupos) para treino e 6 exemplos (3 grupos)
para validação. Cada categoria tem 6 exemplos no treino e 2 na validação.
A revisão humana completa permanece pendente. Um primeiro experimento didático
foi executado; veja `docs/primeiro-treino.md` e `reports/validacao_inicial.json`.
A divisão usa 75% para treino e 25% para validação por grupos. Isso corresponde à razão
60:20 do plano, mas não cria os 20% de teste final que ainda estão pendentes.

O teste final deverá ser preparado sob controle de Flora com grupos reservados
e exemplos novos, sem revelar os textos ao agente de desenvolvimento. As
proporções finais dependerão desse conjunto; este lote não deve ser apresentado
como uma divisão completa 60/20/20.

`data/split_manifest.csv` registra ID, grupo e partição; os textos continuam no
CSV original. `data/split_metadata.json` registra a semente 42 e hashes SHA-256
dos dados e do manifesto. O hash identifica os bytes do arquivo, inclusive
mudanças nas quebras de linha. O divisor ordena grupos pelo hash de semente e
nome, por categoria, e reserva um quarto dos grupos para validação (mínimo um).
Com grupos de tamanhos diferentes, a proporção de linhas pode não ser 75/25.
O divisor exige grupos com um único rótulo; se houver mistura, pede revisão.

Na raiz do projeto, executar:

```powershell
.\.venv\Scripts\python.exe -m scripts.dividir_dados
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

O primeiro comando cria ou substitui os dois arquivos de divisão, sem alterar
os textos. O segundo executa testes com exemplos artificiais separados, sem
abrir teste final. Não trocar semente para melhorar uma pontuação. Se os dados
mudarem, revisar e regenerar o manifesto antes de treinar.
As verificações detectam grupos e duplicatas normalizadas atravessando partes,
mas não comprovam ausência de paráfrases: essa revisão continua necessária.

## Executar a leitura

No PowerShell, na raiz do projeto, com a `.venv` da etapa 2 disponível:

```powershell
.\.venv\Scripts\python.exe scripts\ler_dados.py data\development.csv
```

Resultado esperado: 24 chamados válidos carregados, seguidos de seus textos.
O comando lê e valida o esquema; não verifica automaticamente a correção
semântica dos rótulos nem treina o modelo. Não exige novas bibliotecas.
