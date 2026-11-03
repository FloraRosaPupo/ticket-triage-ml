import React, { useEffect, useState } from "react";
import TopNav from "./components/TopNav";
import StatsOverview from "./components/StatsOverview";
import ClassificationFlow from "./components/ClassificationFlow";
import ClassificationReport from "./components/ClassificationReport";
import FilterBar from "./components/FilterBar";
import KanbanBoard from "./components/KanbanBoard";
import TicketDetails from "./components/TicketDetails";
import { THEMES, STATUSES } from "./constants";

export default function App() {
  const [source, setSource] = useState(() =>
    new URLSearchParams(window.location.search).get("source") === "local"
      ? "local"
      : "randomapi",
  );
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("todos");
  const [selectedId, setSelectedId] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState(null);

  async function loadTickets(signal, classify = false) {
    const started = Date.now();
    setReport({ started, source, tickets: [] });
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/tickets?source=${source}&classify=${classify}`,
        { signal },
      );
      if (!response.ok)
        throw new Error(
          "Não foi possível carregar os chamados. Tente novamente ou escolha os exemplos em português.",
        );
      const data = await response.json();
      if (
        !Array.isArray(data.tickets) ||
        data.tickets.some((t) => !THEMES[t.category] || !STATUSES[t.status])
      )
        throw new Error(
          "Não conseguimos ler os chamados recebidos. Tente novamente.",
        );
      setTickets((previous) =>
        data.tickets.map((t) => ({
          ...t,
          status: previous.find((old) => old.id === t.id)?.status ?? t.status,
        })),
      );
      setReport({
        started,
        finished: Date.now(),
        source,
        tickets: data.tickets,
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message);
        setReport({
          started,
          finished: Date.now(),
          source,
          tickets: [],
          error: err.message,
        });
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    loadTickets(controller.signal);
    return () => controller.abort();
  }, [source]);

  function changeStatus(id, status) {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === id ? { ...ticket, status } : ticket,
      ),
    );
  }

  function resetClassification() {
    setReport((current) =>
      current ? { ...current, reset: Date.now() } : null,
    );
    setTickets((current) =>
      current.map((ticket) => ({
        ...ticket,
        category: "revisao",
        translated_text: undefined,
        classification_note:
          "O assunto deste chamado ainda não foi identificado. Clique em Identificar assuntos para organizar por tema.",
      })),
    );
    setTheme("todos");
    setQuery("");
  }
  const normalize = (value) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const filtered = tickets.filter(
    (t) =>
      (theme === "todos" || t.category === theme) &&
      normalize(
        `${t.id} ${t.title} ${t.text} ${t.customer} ${t.company}`,
      ).includes(normalize(query.trim())),
  );
  const counts = tickets.reduce(
    (acc, ticket) => ({
      ...acc,
      [ticket.category]: (acc[ticket.category] || 0) + 1,
    }),
    { todos: tickets.length },
  );
  const selected = tickets.find((t) => t.id === selectedId);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Pular para os chamados
      </a>
      <TopNav total={tickets.length} />
      <main id="main">
        <div className="topbar">
          <span>
            Workspace <span className="separator">/</span> <b>Suporte</b>
          </span>
          <span className="demo-pill">
            <i /> Dados de demonstração
          </span>
        </div>
        <div className="page-content">
          <header className="page-header">
            <div>
              <p className="eyebrow">OPERAÇÃO / ATENDIMENTO</p>
              <h1>
                Fila de atendimento<span className="title-dot">.</span>
              </h1>
              <p>
                Receba os chamados, identifique o assunto e acompanhe a
                resolução.
              </p>
            </div>
            <div className="classification-actions">
              <button
                className="secondary-button"
                onClick={() => setShowReport(true)}
              >
                Ver classificação
              </button>
              <button
                className="secondary-button"
                disabled={
                  loading ||
                  !tickets.some((ticket) => ticket.category !== "revisao")
                }
                onClick={resetClassification}
              >
                Voltar para antes da classificação
              </button>
              <button
                className="primary-button"
                disabled={loading}
                onClick={() => loadTickets(undefined, true)}
              >
                <span aria-hidden="true">↻</span>
                {loading ? "Carregando…" : "Identificar assuntos"}
              </button>
            </div>
          </header>
          <div className="source-picker">
            <label>
              Carregar chamados de{" "}
              <select
                aria-label="Fonte dos chamados"
                value={source}
                disabled={loading}
                onChange={(e) => {
                  setTickets([]);
                  setSelectedId(null);
                  setTheme("todos");
                  setQuery("");
                  setSource(e.target.value);
                }}
              >
                <option value="randomapi">Dados da API externa</option>
                <option value="local">Dados mocados</option>
              </select>
            </label>
            <span>
              {source === "randomapi"
                ? "Chamados fictícios obtidos pela internet"
                : "Chamados de exemplo para acompanhar a identificação dos assuntos"}
            </span>
          </div>
          <StatsOverview tickets={tickets} />
          <ClassificationFlow tickets={tickets} loading={loading} />
          <div className="automation-note">
            <span className="spark" aria-hidden="true">
              ✧
            </span>
            <div>
              <strong>
                {source === "randomapi"
                  ? "Assuntos identificados a partir da tradução"
                  : "Prontos para identificar os assuntos"}
              </strong>
              <span>
                {source === "randomapi"
                  ? "As mensagens em inglês são traduzidas antes de receber um tema sugerido. Confira o resultado nos detalhes do chamado."
                  : "Os chamados chegam aguardando revisão. Clique em Identificar assuntos para organizá-los por tema."}
              </span>
            </div>
          </div>
          <section className="board-section" aria-labelledby="board-title">
            <div className="board-heading">
              <div>
                <h2 id="board-title">Quadro de chamados</h2>
                <span>{filtered.length} chamados nesta visualização</span>
              </div>
              <span className="board-view">Chamados por tema</span>
            </div>
            <FilterBar
              query={query}
              onQuery={setQuery}
              theme={theme}
              onTheme={setTheme}
              counts={counts}
            />
            <div aria-live="polite">
              {loading && (
                <div className="loading-state">
                  <span className="spinner" />
                  Carregando os chamados…
                </div>
              )}
              {error && (
                <div className="error-state" role="alert">
                  {error}
                  <button disabled={loading} onClick={() => loadTickets()}>
                    Tentar novamente
                  </button>
                </div>
              )}
            </div>
            {!loading && !error && (
              <KanbanBoard
                tickets={filtered}
                onOpen={setSelectedId}
                onStatus={changeStatus}
              />
            )}
          </section>
          <footer className="page-footer">
            <span>Fila · um projeto de aprendizado</span>
            <span>
              Chamados de demonstração · Alterações de status somente nesta
              sessão
            </span>
          </footer>
        </div>
      </main>
      {selected && (
        <TicketDetails
          ticket={selected}
          onClose={() => setSelectedId(null)}
          onStatus={changeStatus}
        />
      )}
      {showReport && (
        <ClassificationReport
          report={report}
          loading={loading}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
