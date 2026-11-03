import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import StatsOverview from "./components/StatsOverview";
import FilterBar from "./components/FilterBar";
import KanbanBoard from "./components/KanbanBoard";
import TicketDetails from "./components/TicketDetails";
import { THEMES, STATUSES } from "./constants";

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("todos");
  const [groupBy, setGroupBy] = useState("status");
  const [selectedId, setSelectedId] = useState(null);

  async function loadTickets(signal) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/tickets", { signal });
      if (!response.ok)
        throw new Error(
          "Não foi possível carregar os chamados. Verifique se a API Python está em execução.",
        );
      const data = await response.json();
      if (
        !Array.isArray(data.tickets) ||
        data.tickets.some((t) => !THEMES[t.category] || !STATUSES[t.status])
      )
        throw new Error("A API retornou dados inválidos.");
      setTickets((previous) =>
        data.tickets.map((t) => ({
          ...t,
          status: previous.find((old) => old.id === t.id)?.status ?? t.status,
        })),
      );
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    loadTickets(controller.signal);
    return () => controller.abort();
  }, []);

  function changeStatus(id, status) {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === id ? { ...ticket, status } : ticket,
      ),
    );
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
      <Sidebar total={tickets.length} />
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
              <p className="eyebrow">CENTRAL DE SUPORTE</p>
              <h1>Cada chamado, no seu lugar.</h1>
              <p>Acompanhe sua fila e deixe a primeira triagem com o modelo.</p>
            </div>
            <button
              className="primary-button"
              disabled={loading}
              onClick={() => loadTickets()}
            >
              <span aria-hidden="true">↻</span>
              {loading ? "Classificando…" : "Reclassificar chamados"}
            </button>
          </header>
          <StatsOverview tickets={tickets} />
          <div className="automation-note">
            <span className="spark" aria-hidden="true">
              ✧
            </span>
            <div>
              <strong>Triagem automática por tema</strong>
              <span>
                Os textos são classificados ao carregar. Você acompanha o
                atendimento.
              </span>
            </div>
            <span className="model-label">TF-IDF + regressão logística</span>
          </div>
          <section className="board-section" aria-labelledby="board-title">
            <div className="board-heading">
              <div>
                <h2 id="board-title">Quadro de chamados</h2>
                <span>{filtered.length} chamados nesta visualização</span>
              </div>
              <span className="board-view">▦ Kanban</span>
            </div>
            <FilterBar
              query={query}
              onQuery={setQuery}
              theme={theme}
              onTheme={setTheme}
              groupBy={groupBy}
              onGroupBy={setGroupBy}
              counts={counts}
            />
            <div aria-live="polite">
              {loading && (
                <div className="loading-state">
                  <span className="spinner" />
                  Carregando e classificando os chamados…
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
                groupBy={groupBy}
                onOpen={setSelectedId}
                onStatus={changeStatus}
              />
            )}
          </section>
          <footer className="page-footer">
            <span>Fila · um projeto de aprendizado</span>
            <span>
              Dados fictícios · Modelo didático · Alterações de status somente
              nesta sessão
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
    </div>
  );
}
