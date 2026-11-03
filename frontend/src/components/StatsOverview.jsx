import React from "react";

export default function StatsOverview({ tickets }) {
  const stats = [
    ["Total de chamados", tickets.length, "na demonstração", "◫"],
    [
      "Em aberto",
      tickets.filter((t) => t.status !== "resolvido").length,
      "aguardando resolução",
      "◷",
    ],
    [
      "Prioridade alta",
      tickets.filter((t) => t.priority === "alta" && t.status !== "resolvido")
        .length,
      "precisam de atenção",
      "↗",
    ],
    [
      "Resolvidos",
      tickets.filter((t) => t.status === "resolvido").length,
      "atendimento concluído",
      "✓",
    ],
  ];
  return (
    <section className="stats" aria-label="Indicadores gerais">
      {stats.map(([label, value, note, icon]) => (
        <article className="stat" key={label}>
          <div>
            {label}
            <span aria-hidden="true">{icon}</span>
          </div>
          <strong>{value}</strong>
          <small>{note}</small>
        </article>
      ))}
    </section>
  );
}
