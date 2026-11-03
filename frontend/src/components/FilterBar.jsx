import React from "react";
import { THEMES } from "../constants";

export default function FilterBar({ query, onQuery, theme, onTheme, counts }) {
  return (
    <div className="filters">
      <div className="filter-top">
        <label className="search">
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="Buscar chamados"
            placeholder="Buscar por chamado, cliente ou mensagem..."
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="theme-tabs" aria-label="Filtrar por tema">
        {[["todos", "Todos os temas"], ...Object.entries(THEMES)].map(
          ([key, label]) => (
            <button
              type="button"
              key={key}
              aria-pressed={theme === key}
              className={theme === key ? "selected" : ""}
              onClick={() => onTheme(key)}
            >
              {label}
              <span>{counts[key] || 0}</span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}
