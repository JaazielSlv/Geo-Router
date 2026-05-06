import { geoRouteApi } from './api.js';
import { getCountryLabel, parseAsNumber } from './utils.js';

const MAP_COORDINATES = {
  28513: [-23.5505, -46.6333],
  27699: [-22.9068, -43.1729],
  4230: [-15.7942, -47.8822],
  1916: [-23.5505, -46.6333],
  53006: [-8.0476, -34.877],
  262287: [-3.7319, -38.5267],
  28186: [-12.9714, -38.5014],
  14840: [-25.4284, -49.2673],
  263432: [-29.1685, -51.1792],
  265680: [-19.9191, -43.9386],
  61678: [-23.5505, -46.6333],
  52532: [-22.9068, -43.1729],
  271180: [-3.7319, -38.5267],
  267613: [-25.4284, -49.2673],
  268580: [-29.1685, -51.1792],
  3356: [39.7392, -104.9903],
  1299: [59.3293, 18.0686],
  3257: [40.7128, -74.006],
  174: [38.9072, -77.0369],
  2914: [35.6762, 139.6503],
  6762: [41.9028, 12.4964],
  6939: [37.7749, -122.4194]
};

let asData = [];
let asIndex = new Map();
let map;
let asMarkers;
let connectionLines;

window.addEventListener('DOMContentLoaded', initializeMap);

function normalizeConnections(record) {
  const rawConnections = [
    ...(Array.isArray(record.connections) ? record.connections : []),
    ...(Array.isArray(record.upstreams) ? record.upstreams : []),
    ...(Array.isArray(record.peers) ? record.peers : [])
  ];

  return Array.from(new Set(rawConnections.map(parseAsNumber).filter(Number.isFinite)));
}

function normalizeMapRecord(record) {
  const asn = parseAsNumber(record.asn ?? record.id);
  const coords = MAP_COORDINATES[asn] || [0, 0];

  return {
    asn,
    name: record.org || record.name || `AS${asn}`,
    lat: Number(record.lat ?? coords[0]),
    lng: Number(record.lng ?? coords[1]),
    type: record.type || 'enterprise',
    region: record.region || record.country || 'BR',
    country: getCountryLabel(record.country),
    connections: normalizeConnections(record)
  };
}

async function loadMapData() {
  const database = await geoRouteApi.loadFallbackDatabase();
  const records = Array.isArray(database.autonomousSystems) ? database.autonomousSystems : [];

  asData = records.map(normalizeMapRecord);
  asIndex = new Map(asData.map(item => [item.asn, item]));
}

async function initializeMap() {
  try {
    await loadMapData();

    map = L.map('map').setView([-15, -55], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    asMarkers = L.layerGroup().addTo(map);
    connectionLines = L.layerGroup().addTo(map);

    asData.forEach(as => {
      asMarkers.addLayer(createAsMarker(as));
    });

    drawConnections();
    setupEventListeners();

    L.control.layers(null, {
      'AS Nodes': asMarkers,
      'Connections': connectionLines
    }).addTo(map);

    showStatus('Mapa carregado com dados do JSON local!', 'success');
  } catch (error) {
    console.error('Erro ao inicializar mapa:', error);
    showStatus('Erro ao carregar mapa. Tente recarregar a página.', 'danger');
  }
}

function getAsColor(type) {
  switch (type) {
    case 'transit':
      return '#007bff';
    case 'content':
      return '#28a745';
    case 'enterprise':
      return '#ffc107';
    default:
      return '#6c757d';
  }
}

function createAsMarker(as) {
  const color = getAsColor(as.type);
  const marker = L.circleMarker([as.lat, as.lng], {
    color,
    fillColor: color,
    fillOpacity: 0.9,
    radius: 12,
    weight: 3,
    opacity: 1
  });

  marker.bindPopup(`
    <div class="text-center p-2">
      <h6 class="mb-2">AS${as.asn}</h6>
      <p class="mb-2 fw-bold">${as.name}</p>
      <p class="mb-2"><small class="text-muted">${as.type.toUpperCase()}</small></p>
      <p class="mb-3"><small>Conexões: ${as.connections.length}</small></p>
      <a href="as_detail.html?asn=${as.asn}" class="btn btn-sm btn-primary">Ver Detalhes</a>
    </div>
  `, {
    maxWidth: 300,
    className: 'custom-popup'
  });

  marker.on('click', function() {
    highlightConnections(as.asn);
    updateAsInfoPanel(as);
    this.openPopup();
  });

  marker.bindTooltip(`AS${as.asn} - ${as.name}`, {
    permanent: false,
    direction: 'top',
    offset: [0, -10]
  });

  return marker;
}

function drawConnections() {
  if (!connectionLines) return;

  connectionLines.clearLayers();

  asData.forEach(as => {
    as.connections.forEach(connectedAsn => {
      const connectedAs = asIndex.get(connectedAsn);
      if (connectedAs) {
        L.polyline([[as.lat, as.lng], [connectedAs.lat, connectedAs.lng]], {
          color: getAsColor(as.type),
          weight: 1,
          opacity: 0.6,
          dashArray: '5, 5'
        }).addTo(connectionLines);
      }
    });
  });
}

function highlightConnections(asn) {
  if (!connectionLines) return;

  connectionLines.clearLayers();

  const selectedAs = asIndex.get(asn);
  if (!selectedAs) return;

  selectedAs.connections.forEach(connectedAsn => {
    const connectedAs = asIndex.get(connectedAsn);
    if (connectedAs) {
      L.polyline([[selectedAs.lat, selectedAs.lng], [connectedAs.lat, connectedAs.lng]], {
        color: '#ff0000',
        weight: 3,
        opacity: 1
      }).addTo(connectionLines);
    }
  });
}

function filterAs(searchTerm) {
  if (!asMarkers) return;

  asMarkers.clearLayers();

  const filteredAs = asData.filter(as =>
    as.asn.toString().includes(searchTerm) ||
    as.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  filteredAs.forEach(as => {
    asMarkers.addLayer(createAsMarker(as));
  });

  if (filteredAs.length > 0) {
    map.fitBounds(L.latLngBounds(filteredAs.map(as => [as.lat, as.lng])), { padding: [20, 20] });
  }
}

function filterByRegion(region) {
  if (!asMarkers) return;

  asMarkers.clearLayers();

  const filteredAs = region ? asData.filter(as => as.region === region) : asData;

  filteredAs.forEach(as => {
    asMarkers.addLayer(createAsMarker(as));
  });
}

function updateAsInfoPanel(as) {
  const panel = document.getElementById('asInfoPanel');
  const content = document.getElementById('asInfoContent');
  const connections = as.connections || [];

  const connectionDetails = connections.map(asn => {
    const connectedAs = asIndex.get(asn);
    return connectedAs ? {
      asn,
      name: connectedAs.name,
      type: connectedAs.type,
      country: connectedAs.country
    } : {
      asn,
      name: 'Nome não disponível',
      type: 'Tipo não especificado',
      country: 'País não especificado'
    };
  });

  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">AS ${as.asn}</h5>
      </div>
      <div class="card-body">
        <h6 class="card-subtitle mb-3 text-muted">${as.name}</h6>
        <p class="mb-2"><strong>Tipo:</strong> ${as.type || 'Não especificado'}</p>
        <p class="mb-3"><strong>País:</strong> ${as.country || 'Não especificado'}</p>

        <h6>Conexões (${connections.length})</h6>
        <div class="connections-list">
          ${connectionDetails.length > 0 ? connectionDetails.map(conn => `
            <div class="connection-item mb-2 p-2 border rounded">
              <small><strong>AS${conn.asn}</strong> - ${conn.name}</small><br>
              <small class="text-muted">${conn.type} • ${conn.country}</small>
            </div>
          `).join('') : '<small class="text-muted">Nenhuma conexão registrada</small>'}
        </div>

        <div class="mt-3">
          <a href="as_detail.html?asn=${as.asn}" class="btn btn-primary btn-sm">Ver Detalhes</a>
          <button class="btn btn-outline-secondary btn-sm ms-2 center-on-as-btn" type="button" data-lat="${as.lat}" data-lng="${as.lng}">Centralizar</button>
        </div>
      </div>
    </div>
  `;

  const centerButton = panel.querySelector('.center-on-as-btn');
  centerButton?.addEventListener('click', event => {
    centerOnAs(Number(event.currentTarget.dataset.lat), Number(event.currentTarget.dataset.lng));
  });

  panel.classList.remove('d-none');
}

function centerOnAs(lat, lng) {
  map.setView([lat, lng], 8);
}

function setupEventListeners() {
  document.getElementById('searchInput').addEventListener('input', event => {
    const searchTerm = event.target.value.trim();

    if (searchTerm.length > 0) {
      filterAs(searchTerm);
      return;
    }

    asMarkers.clearLayers();
    asData.forEach(as => asMarkers.addLayer(createAsMarker(as)));
    map.setView([-15, -55], 4);
  });

  document.getElementById('regionFilter').addEventListener('change', event => {
    filterByRegion(event.target.value);
  });

  document.getElementById('resetViewBtn').addEventListener('click', () => {
    map.setView([-15, -55], 4);
  });

  document.getElementById('toggleConnectionsBtn').addEventListener('click', function() {
    if (!map || !connectionLines) return;

    if (map.hasLayer(connectionLines)) {
      map.removeLayer(connectionLines);
      this.textContent = 'Mostrar Conexões';
    } else {
      map.addLayer(connectionLines);
      this.textContent = 'Ocultar Conexões';
    }
  });

  document.getElementById('showLegendBtn').addEventListener('click', () => {
    document.getElementById('legend').classList.toggle('d-none');
  });
}

function showStatus(message, type = 'info') {
  const statusDiv = document.getElementById('statusDiv') || createStatusDiv();
  statusDiv.innerHTML = `<div class="alert alert-${type}"><i class="fas fa-info-circle"></i> ${message}</div>`;
  statusDiv.style.display = 'block';
  setTimeout(() => statusDiv.style.display = 'none', 5000);
}

function createStatusDiv() {
  const div = document.createElement('div');
  div.id = 'statusDiv';
  div.style.position = 'fixed';
  div.style.top = '20px';
  div.style.right = '20px';
  div.style.zIndex = '1000';
  div.style.maxWidth = '300px';
  document.body.appendChild(div);
  return div;
}
