# Painel de suporte: construção passo a passo

O seletor apresenta “Dados da API externa” e “Dados mocados”. O botão
“Ver classificação” abre `ClassificationReport`: um modal com o fluxo,
horários de envio/recebimento da última execução, duração total e resultado
por chamado. Ele permite comparar a mensagem original e o texto efetivamente
usado pelo classificador. Não simula logs internos em tempo real. O histórico
da última execução fica na memória da tela; ao reiniciar a triagem, recebe uma
anotação sem apagar o resultado anterior. Uma nova consulta substitui o registro.

O quadro é organizado exclusivamente por tema: Acesso, Cobrança, Problema
técnico e Aguardando revisão. O status permanece no chamado e não define sua
coluna. `ClassificationFlow` mostra o processo em três etapas — recebimento,
identificação do assunto e organização — com contagens derivadas dos dados.
O layout usa navegação superior e detalhes em uma lateral, com textos voltados
à pessoa que atende, sem termos de implementação nas orientações do painel.

## Integração com dados externos

A fonte padrão agora é a [RandomAPI](https://randomapi.dev/apis/support-tickets).
`backend/providers.py` busca 12 chamados com semente e intervalo de datas fixos,
adapta status, prioridade e canal e seleciona somente mensagens do solicitante.
Não usa mensagens do agente como se fossem pedidos do cliente.

`GET /api/tickets?source=randomapi` consulta a fonte externa com timeout de 15
segundos. Falhas retornam HTTP 502 e permitem tentar novamente ou escolher a
fonte local. Não há substituição silenciosa por dados locais.

Os textos externos são traduzidos pelo MyMemory antes da classificação.
`backend/translation.py` traduz título e mensagens do solicitante, mantém o
original e inclui a tradução nos detalhes. Trechos repetidos são guardados em
cache na memória para reduzir chamadas. O serviço gratuito permite 5.000
caracteres por dia e 500 bytes por trecho; erros deixam o chamado aguardando
revisão, sem inventar uma tradução. Apenas os exemplos fictícios são enviados.
Referências: [especificação](https://mymemory.translated.net/doc/spec.php) e
[limites](https://mymemory.translated.net/doc/usagelimits.php).

`GET /api/tickets?source=local` deixa os exemplos portugueses aguardando revisão.
O botão “Identificar assuntos” usa `classify=true` para classificá-los.
“Voltar para antes da classificação” limpa as sugestões apenas na interface,
preservando mensagens e status. É possível classificar novamente.
O seletor de fonte no painel alterna entre esses dois fluxos. As mudanças de
status continuam apenas na sessão; nenhuma escrita é enviada à RandomAPI.

Os passos abaixo descrevem a base local e os componentes compartilhados.

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
| `TopNav` | Mostra a identidade e a navegação do painel. |
| `StatsOverview` | Calcula os indicadores gerais a partir dos chamados. |
| `FilterBar` | Recebe valores de filtros e notifica o App quando mudam. |
| `KanbanBoard` | Agrupa chamados por tema e cria as colunas. |
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
