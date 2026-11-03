import React from "react";

export default function Sidebar({ total }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#main">
        <span className="brand-mark">f.</span> fila
        <span className="brand-dot">®</span>
      </a>
      <div className="workspace">
        <span className="workspace-avatar">S</span>
        <div>
          Workspace de estudo<small>Central de suporte</small>
        </div>
      </div>
      <p className="nav-caption">ESPAÇO DE TRABALHO</p>
      <a className="nav-active" href="#main">
        <span aria-hidden="true">▦</span> Quadro de chamados <b>{total}</b>
      </a>
      <div className="sidebar-note">
        <span className="live-dot" /> Triagem automática
        <p>
          Mais contexto.
          <br />
          Menos trabalho manual.
        </p>
        <small>
          Temas sugeridos pelo seu modelo de aprendizado de máquina.
        </small>
      </div>
      <div className="profile">
        <span className="avatar">FP</span>
        <div>
          Flora Pupo<small>Ambiente de demonstração</small>
        </div>
      </div>
    </aside>
  );
}
