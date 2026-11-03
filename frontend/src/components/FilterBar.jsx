import React from "react";
import { THEMES } from "../constants";

export default function FilterBar({
  query,
  onQuery,
  theme,
  onTheme,
  groupBy,
  onGroupBy,
  counts,
}) {
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
        <label className="group-label">
          Agrupar por{" "}
          <select value={groupBy} onChange={(e) => onGroupBy(e.target.value)}>
            <option value="status">Status</option>
            <option value="category">Tema</option>
          </select>
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
