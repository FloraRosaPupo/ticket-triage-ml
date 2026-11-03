import React from "react";

export default function ClassificationFlow({ tickets, loading }) {
  const pending = tickets.filter(
    (ticket) => ticket.category === "revisao",
  ).length;
  const classified = tickets.length - pending;
  const steps = [
    [
      "Chamados recebidos",
      loading
        ? "Buscando mensagens…"
        : `${tickets.length} mensagens disponíveis para atendimento`,
    ],
    [
      "Identificação do assunto",
      loading
        ? "Aguardando as mensagens"
        : `${classified} com tema sugerido · ${pending} aguardando revisão`,
    ],
    [
      "Organização por tema",
      loading
        ? "O quadro será atualizado em seguida"
        : "Filtre por assunto e acompanhe o atendimento",
    ],
  ];
  return (
    <section
      className="classification-flow"
      aria-label="Como os chamados são organizados"
      aria-live="polite"
    >
      {steps.map(([title, description], index) => (
        <div className="flow-step" key={title}>
          <span className="flow-number">{index + 1}</span>
          <div>
            <strong>{title}</strong>
            <p>{description}</p>
          </div>
          {index < steps.length - 1 && (
            <span className="flow-arrow" aria-hidden="true">
              →
            </span>
          )}
        </div>
      ))}
    </section>
  );
}
