import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="page-shell container-wide page-stack">
      <header className="page-hero card">
        <span className="badge">404</span>
        <h1>Página não encontrada</h1>
        <p>O endereço solicitado não existe nesta aplicação.</p>
        <Link className="btn btn-primary" to="/">Voltar para a Home</Link>
      </header>
    </main>
  );
}