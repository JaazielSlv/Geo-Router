import { geoRouteApi } from './api.js';
import { getCountryLabel, normalizeAsn, parseAsNumber } from './utils.js';

function getUrlParameter(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function buildLookup(records) {
  const lookup = new Map();

  records.forEach(record => {
    lookup.set(parseAsNumber(record.asn ?? record.id), record);
  });

  return lookup;
}

function enrichConnections(connectionValues, lookup) {
  return connectionValues.map(connectionValue => {
    const asn = parseAsNumber(connectionValue);
    const related = lookup.get(asn);

    return {
      asn: `AS${asn}`,
      org: related ? related.org : `AS${asn}`
    };
  });
}

function buildRouteHistory(record) {
  const prefixes = Array.isArray(record.prefixes) ? record.prefixes : [];
  const dateBase = new Date('2026-03-21T15:45:00');

  return prefixes.slice(0, 3).map((prefix, index) => {
    const timestamp = new Date(dateBase.getTime() - index * 4500000).toISOString().replace('T', ' ').slice(0, 19);

    return {
      timestamp,
      prefix,
      action: index === 0 ? 'Anúncio' : 'Atualização',
      status: 'Sucesso'
    };
  });
}

function normalizeDetailRecord(record, lookup) {
  const asn = parseAsNumber(record.asn ?? record.id);
  const upstreamValues = Array.isArray(record.upstreams) ? record.upstreams : [];
  const peerValues = Array.isArray(record.peers) ? record.peers : [];
  const connections = Array.from(new Set([...upstreamValues, ...peerValues]));

  return {
    asn: `AS${asn}`,
    org: record.org || record.name || `AS${asn}`,
    country: record.country || 'BR',
    description: record.description || `Dados carregados do JSON local para ${record.org || `AS${asn}`}.`,
    prefixes: Array.isArray(record.prefixes) ? record.prefixes : [],
    upstreams: enrichConnections(upstreamValues, lookup),
    peers: enrichConnections(peerValues, lookup),
    routes: record.routes || (Array.isArray(record.prefixes) ? record.prefixes.length * 100 : 0),
    lastUpdate: record.lastUpdate || 'Carregado do db.json',
    status: record.status || 'Ativo',
    type: record.type || 'transit',
    routeHistory: Array.isArray(record.routeHistory) ? record.routeHistory : buildRouteHistory(record),
    links: connections.map(connectionValue => ({
      source: `AS${asn}`,
      target: `AS${parseAsNumber(connectionValue)}`
    }))
  };
}

async function loadDetailData() {
  const database = await geoRouteApi.loadFallbackDatabase();
  const records = Array.isArray(database.autonomousSystems) ? database.autonomousSystems : [];
  const lookup = buildLookup(records);
  const normalized = new Map();

  records.forEach(record => {
    const asn = parseAsNumber(record.asn ?? record.id);
    normalized.set(`AS${asn}`, normalizeDetailRecord(record, lookup));
  });

  return normalized;
}

function renderNotFound() {
  document.getElementById('asnTitle').textContent = 'ASN não encontrado';
  document.getElementById('info').innerHTML = `
    <div class="alert alert-warning">
      <h4 class="alert-heading">ASN não encontrado</h4>
      <p>O Sistema Autônomo solicitado não foi encontrado no JSON local.</p>
      <hr>
      <p class="mb-0">Tente buscar por outro ASN na página de <a href="search.html">busca</a>.</p>
    </div>
  `;
}

function renderDetailPage(data) {
  const flagIcon = data.country === 'BR' ? '🇧🇷' : data.country === 'US' ? '🇺🇸' : data.country === 'SE' ? '🇸🇪' : data.country === 'JP' ? '🇯🇵' : '🌍';
  document.getElementById('asnTitle').textContent = `${flagIcon} ${data.asn} - ${data.org}`;

  const typeBadge = data.type === 'transit'
    ? '<span class="badge bg-primary">Transit Provider</span>'
    : '<span class="badge bg-info">Enterprise Network</span>';

  document.getElementById('info').innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <p><strong>ASN:</strong> ${data.asn}</p>
        <p><strong>Organização:</strong> ${data.org}</p>
        <p><strong>Tipo:</strong> ${typeBadge}</p>
        <p><strong>País:</strong> ${getCountryLabel(data.country)}</p>
        <p><strong>Status:</strong> <span class="badge bg-success">${data.status}</span></p>
      </div>
      <div class="col-md-6">
        <p><strong>Descrição:</strong> ${data.description}</p>
        <p><strong>Número de rotas:</strong> ${data.routes}</p>
        <p><strong>Última atualização:</strong> ${data.lastUpdate}</p>
      </div>
    </div>
  `;

  document.getElementById('prefixes').innerHTML = data.prefixes.map(prefix => `
    <div class="col-md-6 col-lg-3">
      <div class="p-2 border rounded bg-light text-center">
        <code>${prefix}</code>
      </div>
    </div>
  `).join('');

  document.getElementById('upstreams').innerHTML = data.upstreams.map(upstream => `
    <div class="mb-2">
      <a href="as_detail.html?asn=${upstream.asn}" class="text-decoration-none">
        <div class="d-flex align-items-center p-2 border rounded hover-bg-light">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-diagram-3 me-2 text-primary" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1.5H10a.5.5 0 0 1 0 1h-1.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6A1.5 1.5 0 0 1 6 4.5v-1zM8.5 5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
            <path d="M9 5.5a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1h-1.5a.5.5 0 0 1-.5-.5z"/>
            <path d="M6.5 8a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 1 0V9a.5.5 0 0 0-.5-.5z"/>
          </svg>
          <div>
            <strong>${upstream.asn}</strong><br>
            <small class="text-muted">${upstream.org}</small>
          </div>
        </div>
      </a>
    </div>
  `).join('');

  document.getElementById('peers').innerHTML = data.peers.map(peer => `
    <div class="mb-2">
      <a href="as_detail.html?asn=${peer.asn}" class="text-decoration-none">
        <div class="d-flex align-items-center p-2 border rounded hover-bg-light">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-share me-2 text-success" viewBox="0 0 16 16">
            <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
          </svg>
          <div>
            <strong>${peer.asn}</strong><br>
            <small class="text-muted">${peer.org}</small>
          </div>
        </div>
      </a>
    </div>
  `).join('');

  document.querySelector('#routeHistory tbody').innerHTML = data.routeHistory.map(entry => `
    <tr>
      <td>${entry.timestamp}</td>
      <td><code>${entry.prefix}</code></td>
      <td>${entry.action}</td>
      <td><span class="badge bg-${entry.status === 'Sucesso' ? 'success' : 'warning'}">${entry.status}</span></td>
    </tr>
  `).join('');

  drawLocalGraph(data);
}

document.addEventListener('DOMContentLoaded', async () => {
  const asn = normalizeAsn(getUrlParameter('asn'));

  try {
    const dataMap = await loadDetailData();
    const data = dataMap.get(asn);

    if (!data) {
      renderNotFound();
      return;
    }

    renderDetailPage(data);
  } catch (error) {
    console.error('Erro ao carregar detalhe do AS:', error);
    renderNotFound();
  }
});

function drawLocalGraph(data) {
  const width = document.getElementById('localGraph').clientWidth;
  const height = 400;
  const nodes = [{ id: data.asn, group: 1 }];
  const links = [];

  data.upstreams.forEach(up => {
    if (!nodes.find(node => node.id === up.asn)) {
      nodes.push({ id: up.asn, group: 2 });
    }
    links.push({ source: data.asn, target: up.asn, type: 'upstream' });
  });

  data.peers.forEach(peer => {
    if (!nodes.find(node => node.id === peer.asn)) {
      nodes.push({ id: peer.asn, group: 3 });
    }
    links.push({ source: data.asn, target: peer.asn, type: 'peer' });
  });

  const svg = d3.select('#localGraph').append('svg')
    .attr('width', width)
    .attr('height', height);

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const link = svg.append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke-width', d => d.type === 'upstream' ? 3 : 2)
    .attr('stroke', d => d.type === 'upstream' ? '#0d6efd' : '#198754');

  const node = svg.append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', d => d.group === 1 ? 25 : 20)
    .attr('fill', d => {
      if (d.group === 1) return '#0d6efd';
      if (d.group === 2) return '#6c757d';
      return '#198754';
    });

  node.append('title').text(d => d.id);

  const text = svg.append('g')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 12)
    .selectAll('text')
    .data(nodes)
    .join('text')
    .attr('x', 0)
    .attr('y', 0)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .attr('font-weight', 'bold')
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

    text
      .attr('x', d => d.x)
      .attr('y', d => d.y);
  });
}
