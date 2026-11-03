# Painel de suporte: construção passo a passo

O painel usa React e Parcel. A API local usa Python e carrega a pipeline já
treinada. Não há um segundo modelo nem treinamento no navegador.

## 1. Dados fictícios

`data/demo_tickets.json` contém nove chamados fictícios com `id`, `title`,
`text`, `customer`, `company`, `channel`, `priority`, `status` e `created_at`.
Clientes e empresas são fictícios. Os temas não são pré-preenchidos:
`category` é calculado pela API usando o texto de cada chamado.

Os textos reutilizam cenários conhecidos para demonstrar o fluxo visual.
Não representam uma avaliação independente e não entram no treino ou na validação.
As datas são fixas; os contadores não são indicadores de atendimento do dia.

## 2. API Python

`backend/server.py` carrega `models/classificador.joblib` uma vez ao iniciar.
Ao receber `GET /api/tickets`, lê o JSON, chama `predict` com as mensagens e
devolve os chamados com suas categorias sugeridas. `GET /api/health` indica
se o servidor está ativo e o modelo carregado.

É um servidor de demonstração restrito ao computador local, sem autenticação
ou banco de dados. Não deve ser exposto como servidor de produção.

## 3. Entrada do React

`frontend/src/index.html` contém o elemento `root`.
`main.jsx` monta o componente `App` dentro dele e importa os estilos.
Parcel executa e compila o front-end; `.proxyrc.json` encaminha `/api` para
o servidor Python, evitando configurar CORS no fluxo local.

## 4. Componentes

| Componente | Responsabilidade |
|---|---|
| `App` | Busca dados na API e mantém chamados, filtros, carregamento, erro e chamado selecionado. |
| `Sidebar` | Mostra a identidade e a navegação do painel. |
| `StatsOverview` | Calcula os indicadores gerais a partir dos chamados. |
| `FilterBar` | Recebe valores de filtros e notifica o App quando mudam. |
| `KanbanBoard` | Agrupa chamados por status ou por tema e cria as colunas. |
| `TicketCard` | Mostra um chamado, abre seus detalhes e permite alterar status. |
| `TicketDetails` | Exibe a mensagem completa em um diálogo com navegação por teclado. |

As informações chegam aos componentes por **props**. Os dados que mudam ficam
no **estado**, criado com `useState`. Por exemplo, ao alterar o status de um
cartão, `onStatus` avisa o App; ele atualiza o estado e o React atualiza o quadro
e os contadores. O tema é uma sugestão do modelo; o status é controlado pela pessoa.

`useEffect` inicia a carga dos chamados ao abrir a página e cancela a requisição
se a tela for desmontada. Carregamento, erro e colunas vazias têm estados visuais.

## 5. Executar localmente

Prepare a `.venv`, instale `requirements.txt` e execute o treino conforme o README.
Depois, na raiz do repositório, abra um terminal para a API:

```powershell
.\.venv\Scripts\python.exe -m backend.server
```

Em outro terminal:

```powershell
cd frontend
npm install
npm run dev
```

Abra http://127.0.0.1:1234. A API fica em http://127.0.0.1:8000.
Os dois processos precisam permanecer ativos. Use Ctrl+C para encerrá-los.

O carregamento classifica automaticamente os chamados. O botão “Reclassificar
chamados” faz uma nova consulta, preservando os status alterados na sessão.
Recarregar a página restaura os status do JSON. Não há persistência no servidor.

## 6. Verificar

Em `frontend`, `npm run build` gera a compilação em `dist`.
Com API e front-end ativos, `npm run test:e2e` verifica as interações no navegador.
O Playwright utiliza o Microsoft Edge instalado no Windows.

Referências: [estado compartilhado no React](https://react.dev/learn/sharing-state-between-components)
e [documentação do Parcel](https://parceljs.org/).
