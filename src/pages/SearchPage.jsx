import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSystems } from '../context/SystemsContext';
import { getCountryEmoji, getCountryLabel, getSystemTitle, getTypeLabel, normalizeText } from '../lib/as';

const quickGroups = [
  {
    title: '🇧🇷 AS Brasileiros Principais',
    tone: 'primary',
    asns: [28513, 27699, 4230, 53006, 262287, 28186, 14840, 1916]
  },
  {
    title: '🌍 Transit Providers Internacionais',
    tone: 'success',
    asns: [3356, 1299, 3257, 174, 2914]
  }
];

function ResultCard({ system }) {
  return (
    <article className="card search-result">
      <div className="search-result-head">
        <div>
          <div className="search-title-row">
            <h3>{getSystemTitle(system)}</h3>
            <span className={`pill tone-${system.type === 'transit' ? 'primary' : system.type === 'content' ? 'success' : 'warning'}`}>
              {getTypeLabel(system.type)}
            </span>
          </div>
          <p className="muted-line">{getCountryEmoji(system.country)} {getCountryLabel(system.country)}</p>
        </div>
        <Link className="btn btn-outline" to={`/as/${system.asn}`}>Ver detalhes</Link>
      </div>

      <div className="search-meta-grid">
        <div>
          <strong>Prefixos</strong>
          <p>{system.prefixes.slice(0, 3).join(', ')}{system.prefixes.length > 3 ? '...' : ''}</p>
        </div>
        <div>
          <strong>Rotas ativas</strong>
          <p>{system.routes}</p>
        </div>
        <div>
          <strong>Upstreams</strong>
          <p>{system.upstreams.length}</p>
        </div>
        <div>
          <strong>Peers</strong>
          <p>{system.peers.length}</p>
        </div>
      </div>
    </article>
  );
}

export function SearchPage() {
  const { systems } = useSystems();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const results = useMemo(() => {
    const term = normalizeText(submittedQuery);

    if (!term) {
      return [];
    }

    return systems.filter(system => {
      const haystacks = [
        system.asn,
        system.label,
        system.org,
        system.country,
        system.type,
        ...system.prefixes,
        ...system.upstreams,
        ...system.peers
      ].map(value => normalizeText(value));

      return haystacks.some(value => value.includes(term));
    });
  }, [systems, submittedQuery]);

  const performSearch = value => {
    setSubmittedQuery(value ?? query);
  };

  return (
    <main className="page-shell container-wide page-stack">
      <header className="page-hero card">
        <span className="badge">Busca avançada</span>
        <h1>Investigar Rede</h1>
        <p>Pesquise por ASN, prefixo, organização, país ou tipo de AS sem sair do mesmo visual do site.</p>
      </header>

      <section className="card page-section">
        <h2 className="section-title">Acesso rápido</h2>
        {quickGroups.map(group => (
          <div key={group.title} className="quick-group">
            <h3>{group.title}</h3>
            <div className="chip-row">
              {group.asns.map(asn => {
                const system = systems.find(item => Number(item.asn) === asn);
                return (
                  <button
                    key={asn}
                    type="button"
                    className={`chip chip-${group.tone}`}
                    onClick={() => {
                      const value = String(asn);
                      setQuery(value);
                      setSubmittedQuery(value);
                    }}
                  >
                    {system ? `${system.label} - ${system.org.split(' ')[0]}` : `AS${asn}`}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="card page-section search-panel">
        <div className="search-form">
          <label htmlFor="queryInput">Busca avançada</label>
          <input
            id="queryInput"
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                performSearch();
              }
            }}
            type="text"
            placeholder="Digite ASN, prefixo IP ou nome do provedor"
          />
          <button type="button" className="btn btn-primary" onClick={() => performSearch()}>
            Pesquisar
          </button>
        </div>
      </section>

      <section className="page-section stack-gap">
        {submittedQuery && results.length === 0 ? (
          <div className="card empty-state">Nenhum resultado encontrado para a busca informada.</div>
        ) : null}

        {!submittedQuery ? (
          <div className="card empty-state">Digite um termo para buscar.</div>
        ) : null}

        {results.map(system => <ResultCard key={system.asn} system={system} />)}
      </section>
    </main>
  );
}