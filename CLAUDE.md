# Triagem (ticket-triage-ml)

Classificador didático de chamados (`acesso`, `cobranca`, `problema_tecnico`) com TF-IDF e regressão logística, mais um painel Kanban em React para revisão humana. A base tem **24 exemplos sintéticos** (18 de treino e 6 de validação, separados por grupo de cenário). Revisão humana completa e teste final estão pendentes. **Protótipo, não produção.**

## Arquitetura
```
data/development.csv + split_manifest.csv ──> scripts/treinar.py ──> models/classificador.joblib
                                                      └──> reports/validacao_inicial.json (baseline vs pipeline)

React (Parcel :1234) ──GET /api/tickets?source=──> backend/server.py (127.0.0.1:8000)
                                                    ├── source=randomapi ─> providers.py (RandomAPI, 12 chamados, seed 42, timeout 15s)
                                                    │                       └─> translation.py (MyMemory → PT) ─> joblib.predict
                                                    └── source=local ─────> data/demo_tickets.json
```
- **ML (`scripts/`):**
  - `ler_dados.py` e `dividir_dados.py`: a divisão é por grupo de cenário, com manifesto em `split_manifest.csv` e `split_metadata.json`.
  - `treinar.py`: `Pipeline` (TF-IDF + LogisticRegression) comparado a um baseline, gravando relatório e modelo.
  - `classificar.py`: CLI.
- **API (`backend/`):** `http.server` puro (`ThreadingHTTPServer`), sem framework.
  - Falha da fonte externa devolve **HTTP 502**. Não existe troca silenciosa para dados locais.
  - A tradução mantém o texto original para comparação.
- **Painel (`frontend/src/`):**
  - `App.jsx` (estado, cerca de 290 linhas) e componentes `KanbanBoard`, `TicketCard`, `TicketDetails`, `ClassificationFlow`, `ClassificationReport` (modal com horários e duração), `FilterBar`, `StatsOverview`, `TopNav`.
  - As colunas são por **tema**. O status fica no card e não define a coluna.
- Documentação passo a passo: `docs/` (dados, etapa-2, fluxograma, painel-react, primeiro-treino).

## Comandos (PowerShell)
```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
.\.venv\Scripts\python.exe -m scripts.treinar          # gera models/ e reports/
.\.venv\Scripts\python.exe -m scripts.classificar
.\.venv\Scripts\python.exe -m backend.server           # API em http://127.0.0.1:8000
cd frontend; npm install; npm run dev                  # painel em http://127.0.0.1:1234
npm run test:e2e                                       # Playwright (tests/painel.spec.js)
```
Sem CI: rode os testes manualmente antes de considerar a tarefa pronta.

## Deploy
**Não há deploy.** Tudo roda local (API em `127.0.0.1`). Para publicar seria preciso, no mínimo:
- servir o modelo atrás de um framework (ex.: FastAPI);
- configurar CORS e rate limit, porque RandomAPI e MyMemory são públicos e limitados;
- `npm run build` gera `frontend/dist` estático.
Não publique sem a decisão da Flora.

## Regras
- Nunca misture o mesmo grupo de cenário entre treino e validação (vazamento). Use o manifesto.
- Mudou dados ou modelo: rode `scripts.treinar` e compare `reports/validacao_inicial.json` com a versão anterior.
- Métricas não são desempenho real (dados sintéticos e poucos). Não as divulgue como resultado.
- Dependências Python fixadas com `==`: atualize de forma consciente.
- Agente: `ia-engineer`.
