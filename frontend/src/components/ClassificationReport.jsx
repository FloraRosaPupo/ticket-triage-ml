import React, { useEffect, useRef, useState } from "react";
import { THEMES } from "../constants";

export default function ClassificationReport({ report, loading, onClose }) {
  const dialog = useRef(null);
  const [selectedId, setSelectedId] = useState("");
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  const tickets = report?.tickets || [];
  const ticket = tickets.find((t) => t.id === selectedId) || tickets[0];
  const formatTime = (value) => new Date(value).toLocaleTimeString("pt-BR");
  const classified = tickets.filter((t) => t.category !== "revisao").length;
  return (
    <dialog
      ref={dialog}
      className="classification-dialog"
      aria-labelledby="classification-report-title"
      onCancel={onClose}
    >
      <div className="detail-top">
        <span>ACOMPANHAMENTO DA CLASSIFICAÇÃO</span>
        <button onClick={onClose} aria-label="Fechar classificação">
          ×
        </button>
      </div>
      <h2 id="classification-report-title">
        Como os assuntos foram identificados
      </h2>
      <p className="report-intro">
        Recebemos a mensagem, preparamos o texto e sugerimos um tema. Aqui você
        pode conferir a última execução e o que foi usado em cada chamado.
      </p>
      <ol className="report-flow">
        <li>
          <b>1. Receber</b>
          <span>Buscar as mensagens na fonte escolhida.</span>
        </li>
        <li>
          <b>2. Preparar</b>
          <span>Traduzir para português quando necessário.</span>
        </li>
        <li>
          <b>3. Identificar</b>
          <span>Comparar o texto com os padrões aprendidos nos exemplos.</span>
        </li>
        <li>
          <b>4. Organizar</b>
          <span>Colocar o chamado na coluna do tema sugerido.</span>
        </li>
      </ol>
      <h3>Registro da última execução</h3>
      <div className="execution-log" aria-live="polite">
        {!report && <p>Nenhuma execução registrada nesta sessão.</p>}
        {report && (
          <>
            <p>
              <time>{formatTime(report.started)}</time> Solicitação iniciada ·{" "}
              {report.source === "local"
                ? "Dados mocados"
                : "Dados da API externa"}
            </p>
            {loading && (
              <p>
                Processando os chamados. Os resultados aparecerão quando a
                resposta chegar.
              </p>
            )}
            {report.error && <p role="alert">Falha: {report.error}</p>}
            {report.finished && !report.error && (
              <>
                <p>
                  <time>{formatTime(report.finished)}</time> Resposta recebida ·{" "}
                  {tickets.length} chamados ·{" "}
                  {((report.finished - report.started) / 1000).toFixed(1)} s no
                  total
                </p>
                <p>
                  {classified} com tema sugerido · {tickets.length - classified}{" "}
                  aguardando revisão
                </p>
              </>
            )}
            {report.reset && (
              <p>
                <time>{formatTime(report.reset)}</time> Você voltou para antes
                da classificação. O registro abaixo preserva o resultado
                anterior.
              </p>
            )}
          </>
        )}
      </div>
      <p className="report-caption">
        Os horários registram o envio e a chegada da resposta no navegador. As
        etapas internas são exibidas após a conclusão, não como transmissão ao
        vivo.
      </p>
      {ticket && (
        <>
          <label className="report-ticket-picker">
            Conferir um chamado
            <select
              value={ticket.id}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {tickets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} · {t.title}
                </option>
              ))}
            </select>
          </label>
          <div className="report-texts">
            <section>
              <h3>Mensagem recebida</h3>
              <p>{ticket.text}</p>
            </section>
            <section>
              <h3>Texto usado para identificar o assunto</h3>
              <p>
                {ticket.category === "revisao"
                  ? "Ainda não classificado. Veja a observação abaixo."
                  : ticket.translated_text || ticket.text}
              </p>
              {ticket.translated_text && (
                <small>
                  Tradução do título e das mensagens do cliente. O original foi
                  preservado.
                </small>
              )}
            </section>
          </div>
          <div className="report-result">
            <span>Tema sugerido</span>
            <strong className={`theme-badge ${ticket.category}`}>
              {THEMES[ticket.category]}
            </strong>
          </div>
          <p className="report-intro">
            {ticket.classification_note ||
              "O classificador escolheu o tema com maior probabilidade estimada entre acesso, cobrança e problema técnico. Isso é uma sugestão, não uma garantia de acerto."}
          </p>
        </>
      )}
    </dialog>
  );
}
