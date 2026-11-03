import React from "react";

export default function TopNav({ total }) {
  return (
    <header className="top-nav">
      <a className="brand" href="#main">
        <span className="brand-mark">/</span>fila
        <span className="brand-caption">SUPPORT DESK</span>
      </a>
      <nav aria-label="Navegação principal">
        <a href="#board-title" aria-current="page">
          Chamados <span>{total}</span>
        </a>
      </nav>
      <div className="nav-account">
        <span className="environment">DEMONSTRAÇÃO</span>
        <span className="avatar" aria-label="Flora Pupo">
          FP
        </span>
      </div>
    </header>
  );
}
