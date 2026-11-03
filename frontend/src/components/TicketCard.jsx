import React from "react";
import { THEMES, STATUSES, PRIORITIES } from "../constants";

export default function TicketCard({ ticket, onOpen, onStatus }) {
  return (
    <article className="ticket-card">
      <div className="ticket-top">
        <span>{ticket.id}</span>
        <span className={`priority ${ticket.priority}`}>
          <i />
          {PRIORITIES[ticket.priority]}
        </span>
      </div>
      <button className="ticket-title" onClick={() => onOpen(ticket.id)}>
        {ticket.title}
      </button>
      <p className="ticket-preview">{ticket.text}</p>
      <span className={`theme-badge ${ticket.category}`}>
        <span aria-hidden="true">✧</span> {THEMES[ticket.category]}
      </span>
      <div className="ticket-customer">
        <span className="avatar">
          {ticket.customer
            .split(" ")
            .map((s) => s[0])
            .join("")}
        </span>
        <div>
          {ticket.customer}
          <small>{ticket.company}</small>
        </div>
        <span className="channel">{ticket.channel}</span>
      </div>
      <div className="ticket-footer">
        <span>
          {new Date(ticket.created_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          })}
        </span>
        <select
          aria-label={`Status de ${ticket.id}`}
          value={ticket.status}
          onChange={(e) => onStatus(ticket.id, e.target.value)}
        >
          {Object.entries(STATUSES).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
