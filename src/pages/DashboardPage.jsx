import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSystems } from '../context/SystemsContext';
import { getCountryLabel, getTypeLabel } from '../lib/as';

export function DashboardPage() {
  const { systems } = useSystems();

  const stats = useMemo(() => {
    const totalRoutes = systems.reduce((sum, system) => sum + Number(system.routes || 0), 0);
    const totalPrefixes = systems.reduce((sum, system) => sum + system.prefixes.length, 0);
    const transitCount = systems.filter(system => system.type === 'transit').length;
    const enterpriseCount = systems.filter(system => system.type === 'enterprise').length;

    return {
      total: systems.length,
      totalRoutes,
      totalPrefixes,
      transitCount,
      enterpriseCount
    };
  }, [systems]);

  const topSystems = [...systems]
    .sort((left, right) => Number(right.routes || 0) - Number(left.routes || 0))
    .slice(0, 5);

  const latestCountries = Array.from(new Set(systems.map(system => system.country))).slice(0, 4);

  return (
    <main className="page-shell container-wide page-stack">
      <header className="page-hero card">
        <span className="badge">Dashboard</span>
        <h1>Visão Geral do Sistema</h1>
        <p>Resumo dos AS carregados da base local com a mesma linguagem visual da interface principal.</p>
      </header>

      <section className="stats-grid">
        <article className="card stat-card"><span>AS Monitorados</span><strong>{stats.total}</strong></article>
        <article className="card stat-card"><span>Rotas Ativas</span><strong>{stats.totalRoutes}</strong></article>
        <article className="card stat-card"><span>Prefixos</span><strong>{stats.totalPrefixes}</strong></article>
        <article className="card stat-card"><span>Transit</span><strong>{stats.transitCount}</strong></article>
      </section>

      <section className="grid-two">
        <div className="card page-section">
          <div className="detail-card-head">
            <h3>Principais AS</h3>
            <Link className="btn btn-outline" to="/admin">Abrir CRUD</Link>
          </div>
          <div className="stack-gap">
            {topSystems.map(system => (
              <div key={system.asn} className="stat-row">
                <div>
                  <strong>{system.asn}</strong>
                  <p>{system.org}</p>
                </div>
                <div className="row-meta">
                  <span>{getCountryLabel(system.country)}</span>
                  <span>{getTypeLabel(system.type)}</span>
                  <span>{system.routes} rotas</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card page-section">
          <div className="detail-card-head">
            <h3>Base local</h3>
          </div>
          <div className="stack-gap">
            <p className="muted-line">Países presentes</p>
            <div className="chip-row wrap">
              {latestCountries.map(country => <span key={country} className="chip chip-neutral">{getCountryLabel(country)}</span>)}
            </div>
            <p className="muted-line">Enterprise networks</p>
            <strong>{stats.enterpriseCount}</strong>
            <p className="muted-line">A base é persistida no navegador e pode ser editada na página de gerenciamento.</p>
            <Link className="btn btn-primary" to="/admin">Ir para gerenciamento</Link>
          </div>
        </div>
      </section>
    </main>
  );
}