import React from 'react';

export function ContactPage() {
  return (
    <main className="page-shell container-wide page-stack">
      <header className="page-hero card">
        <span className="badge">Contato</span>
        <h1>Fale com a equipe</h1>
        <p>Caso queira ampliar a base, integrar uma API ou evoluir a visualização, esta página concentra os canais de contato.</p>
      </header>

      <section className="grid-two">
        <article className="card contact-card">
          <h3>Suporte técnico</h3>
          <p>georoute@exemplo.com</p>
          <p>Resposta em até 48 horas úteis.</p>
        </article>
        <article className="card contact-card">
          <h3>Projeto acadêmico</h3>
          <p>Documentação, evolução de features e ajustes visuais podem ser discutidos a partir da mesma base React.</p>
        </article>
      </section>
    </main>
  );
}