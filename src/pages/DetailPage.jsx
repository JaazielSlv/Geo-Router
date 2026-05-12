import React, { useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import * as d3 from 'd3';
import { useSystems } from '../context/SystemsContext';
import { buildRouteHistory, getCountryEmoji, getCountryLabel, getTypeLabel, normalizeAsn, parseAsNumber } from '../lib/as';

function useQueryAsn() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  return params.get('asn');
}

function DetailList({ title, items, tone }) {
  return (
    <div className="card detail-card">
      <div className="detail-card-head">
        <h3>{title}</h3>
        <span className={`pill tone-${tone}`}>{items.length}</span>
      </div>
      <div className="connections-list">
        {items.length > 0 ? items.map(item => (
          <Link key={item.asn} to={`/as/${parseAsNumber(item.asn)}`} className="connection-item">
            <strong>{item.asn}</strong>
            <small>{item.org}</small>
          </Link>
        )) : <p className="muted-line">Nenhum vínculo registrado.</p>}
      </div>
    </div>
  );
}

function getLookup(systems) {
  const lookup = new Map();
  systems.forEach(system => {
    lookup.set(normalizeAsn(system.asn), system);
  });
  return lookup;
}

export function DetailPage() {
  const { systems } = useSystems();
  const routeParams = useParams();
  const queryAsn = useQueryAsn();
  const graphRef = useRef(null);

  const asn = normalizeAsn(routeParams.asn || queryAsn || systems[0]?.asn || '');
  const lookup = useMemo(() => getLookup(systems), [systems]);
  const system = lookup.get(asn) || null;

  const detail = useMemo(() => {
    if (!system) {
      return null;
    }

    const upstreams = (system.upstreams || []).map(item => {
      const related = lookup.get(normalizeAsn(item));
      return {
        asn: normalizeAsn(item),
        org: related?.org || normalizeAsn(item)
      };
    });

    const peers = (system.peers || []).map(item => {
      const related = lookup.get(normalizeAsn(item));
      return {
        asn: normalizeAsn(item),
        org: related?.org || normalizeAsn(item)
      };
    });

    return {
      ...system,
      upstreams,
      peers,
      routeHistory: Array.isArray(system.routeHistory) && system.routeHistory.length > 0 ? system.routeHistory : buildRouteHistory(system)
    };
  }, [lookup, system]);

  useEffect(() => {
    if (!graphRef.current || !detail) {
      return undefined;
    }

    const container = graphRef.current;
    const width = container.clientWidth || 800;
    const height = 400;

    container.replaceChildren();

    const nodes = [{ id: detail.asn, group: 1 }];
    const links = [];

    detail.upstreams.forEach(upstream => {
      if (!nodes.find(node => node.id === upstream.asn)) {
        nodes.push({ id: upstream.asn, group: 2 });
      }
      links.push({ source: detail.asn, target: upstream.asn, type: 'upstream' });
    });

    detail.peers.forEach(peer => {
      if (!nodes.find(node => node.id === peer.asn)) {
        nodes.push({ id: peer.asn, group: 3 });
      }
      links.push({ source: detail.asn, target: peer.asn, type: 'peer' });
    });

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(110))
      .force('charge', d3.forceManyBody().strength(-320))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('stroke-opacity', 0.7)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => d.type === 'upstream' ? 3 : 2)
      .attr('stroke', d => d.type === 'upstream' ? '#56ceff' : '#89ffbf');

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.group === 1 ? 24 : 18)
      .attr('fill', d => (d.group === 1 ? '#56ceff' : d.group === 2 ? '#7f8ea3' : '#89ffbf'))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .call(d3.drag()
        .on('start', event => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on('drag', event => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on('end', event => {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }));

    node.append('title').text(d => d.id);

    const labels = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('fill', '#f1f7ff')
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('font-weight', '700')
      .attr('dy', 28)
      .text(d => d.id);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      labels
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    return () => {
      simulation.stop();
      container.replaceChildren();
    };
  }, [detail]);

  if (!detail) {
    return (
      <main className="page-shell container-wide page-stack">
        <header className="page-hero card">
          <span className="badge">Detalhe AS</span>
          <h1>ASN não encontrado</h1>
          <p>O Sistema Autônomo solicitado não existe na base local.</p>
          <div className="button-row">
            <Link className="btn btn-primary" to="/search">Buscar outro AS</Link>
            <Link className="btn btn-outline" to="/admin">Gerenciar base</Link>
          </div>
        </header>
      </main>
    );
  }

  return (
    <main className="page-shell container-wide page-stack">
      <header className="page-hero card">
        <span className="badge">{getCountryEmoji(detail.country)} {getCountryLabel(detail.country)}</span>
        <h1>{detail.asn} - {detail.org}</h1>
        <p>{detail.description}</p>
      </header>

      <section className="card page-section detail-overview">
        <div className="detail-info-grid">
          <div>
            <strong>ASN</strong>
            <span>{detail.asn}</span>
          </div>
          <div>
            <strong>Organização</strong>
            <span>{detail.org}</span>
          </div>
          <div>
            <strong>Tipo</strong>
            <span>{getTypeLabel(detail.type)}</span>
          </div>
          <div>
            <strong>Status</strong>
            <span>{detail.status}</span>
          </div>
          <div>
            <strong>Rotas</strong>
            <span>{detail.routes}</span>
          </div>
          <div>
            <strong>Última atualização</strong>
            <span>{detail.lastUpdate}</span>
          </div>
        </div>
      </section>

      <section className="grid-two">
        <div className="card detail-card">
          <div className="detail-card-head">
            <h3>Prefixos anunciados</h3>
            <span className="pill tone-primary">{detail.prefixes.length}</span>
          </div>
          <div className="chip-row wrap">
            {detail.prefixes.map(prefix => <span key={prefix} className="chip chip-neutral">{prefix}</span>)}
          </div>
        </div>

        <div className="card detail-card">
          <div className="detail-card-head">
            <h3>Histórico de rotas</h3>
            <span className="pill tone-success">{detail.routeHistory.length}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Prefixo</th>
                  <th>Ação</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {detail.routeHistory.map(entry => (
                  <tr key={`${entry.timestamp}-${entry.prefix}`}>
                    <td>{entry.timestamp}</td>
                    <td><code>{entry.prefix}</code></td>
                    <td>{entry.action}</td>
                    <td><span className="pill tone-success">{entry.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="grid-two">
        <DetailList title="Upstream providers" items={detail.upstreams} tone="primary" />
        <DetailList title="Peers" items={detail.peers} tone="success" />
      </section>

      <section className="card page-section graph-section">
        <div className="detail-card-head">
          <h3>Topologia local</h3>
          <Link className="btn btn-outline" to={`/admin?focus=${parseAsNumber(detail.asn)}`}>Editar no CRUD</Link>
        </div>
        <div ref={graphRef} id="localGraph" />
      </section>
    </main>
  );
}