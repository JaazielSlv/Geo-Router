import React from 'react';

export function AboutPage() {
  return (
    <main className="page-shell container-wide page-stack">
      <header className="page-hero card">
        <span className="badge">Sobre</span>
        <h1>GeoRoute BR</h1>
        <p>Aplicação React para investigação de Sistemas Autônomos, com foco em topologia, visibilidade e manutenção de dados.</p>
      </header>

      <section className="card page-section prose-card">
        <p>
          O projeto foi migrado para React para unificar navegação, dados e visualização sem perder a estética original baseada em azul escuro, vidro e gradientes.
          A home mantém o globo 3D e as telas em tela cheia, enquanto as páginas internas seguem o mesmo vocabulário visual.
        </p>
        <p>
          A base local também ganhou uma tela de gerenciamento para inclusão, edição e exclusão de registros de AS, mantendo tudo funcional mesmo sem backend.
        </p>
      </section>
    </main>
  );
}