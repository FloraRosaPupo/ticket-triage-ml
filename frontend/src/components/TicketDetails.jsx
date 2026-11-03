import React, { useEffect, useRef } from "react";
import { THEMES, STATUSES, PRIORITIES } from "../constants";

export default function TicketDetails({ ticket, onClose, onStatus }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="ticket-dialog"
      onCancel={onClose}
      aria-labelledby="detail-title"
    >
      <div className="detail-top">
        <span>
          {ticket.id} · {ticket.channel}
        </span>
        <button onClick={onClose} aria-label="Fechar detalhes">
          ×
        </button>
      </div>
      <h2 id="detail-title">{ticket.title}</h2>
      <p className="detail-customer">
        {ticket.customer} · {ticket.company}
      </p>
      <div className="detail-message">
        <small>MENSAGEM DO CLIENTE</small>
        <p>{ticket.text}</p>
      </div>
      <div className="classification">
        {ticket.translated_text && (
          <div className="detail-message">
            <small>TRADUÇÃO USADA PARA IDENTIFICAR O ASSUNTO</small>
            <p>{ticket.translated_text}</p>
          </div>
        )}
        <span className={`theme-badge ${ticket.category}`}>
          ✧ {THEMES[ticket.category]}
        </span>
        <p>
          {ticket.classification_note ||
            "Este tema foi sugerido a partir da mensagem do cliente. Confira se ele corresponde ao pedido antes de atender."}
        </p>
      </div>
      <div className="detail-fields">
        <div>
          <small>PRIORIDADE</small>
          <p>{PRIORITIES[ticket.priority]}</p>
        </div>
        <label>
          Status
          <select
            value={ticket.status}
            onChange={(e) => onStatus(ticket.id, e.target.value)}
          >
            {Object.entries(STATUSES).map(([key, label]) => (
              <option value={key} key={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="detail-note">
        Chamado fictício. Mudanças de status são mantidas apenas nesta sessão.
      </p>
    </dialog>
  );
}
