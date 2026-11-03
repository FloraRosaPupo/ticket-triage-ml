import React from "react";
import { THEMES } from "../constants";
import TicketCard from "./TicketCard";

export default function KanbanBoard({ tickets, onOpen, onStatus }) {
  const groups = THEMES;
  return (
    <div className="kanban by-category">
      {Object.entries(groups).map(([key, label]) => {
        const items = tickets.filter((t) => t.category === key);
        return (
          <section
            className={`kanban-column column-${key}`}
            key={key}
            aria-label={label}
          >
            <header className="column-header">
              <h3>
                <i />
                {label}
                <span>{items.length}</span>
              </h3>
              <span aria-hidden="true">···</span>
            </header>
            <div className="column-cards">
              {items.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onOpen={onOpen}
                  onStatus={onStatus}
                />
              ))}
              {!items.length && (
                <p className="empty-column">Nenhum chamado por aqui.</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
