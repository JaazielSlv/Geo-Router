import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { useSystems } from '../context/SystemsContext';
import { getCountryLabel, getSystemTitle, getTypeLabel, normalizeText, parseAsNumber } from '../lib/as';

function getAsColor(type) {
  switch (type) {
    case 'transit':
      return '#2c8cff';
    case 'content':
      return '#34c759';
    default:
      return '#f5b700';
  }
}

export function MapPage() {
  const { systems } = useSystems();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const connectionsLayerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [connectionFilter, setConnectionFilter] = useState('');
  const [showConnections, setShowConnections] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [selectedAsn, setSelectedAsn] = useState(null);

  const filteredSystems = useMemo(() => {
    const term = normalizeText(searchTerm);

    return systems.filter(system => {
      const matchesTerm = !term || [system.asn, system.label, system.org, system.country, system.type, ...system.prefixes]
        .map(value => normalizeText(value))
        .some(value => value.includes(term));

      const matchesRegion = !regionFilter || system.country === regionFilter;

      return matchesTerm && matchesRegion;
    });
  }, [regionFilter, searchTerm, systems]);

  const selectedSystem = filteredSystems.find(system => Number(system.asn) === Number(selectedAsn)) || systems.find(system => Number(system.asn) === Number(selectedAsn)) || filteredSystems[0] || systems[0] || null;

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) {
      return undefined;
    }

    mapRef.current = L.map(mapContainerRef.current, { zoomControl: true }).setView([-15, -55], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(mapRef.current);

    markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
    connectionsLayerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      connectionsLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || !connectionsLayerRef.current) {
      return;
    }

    markersLayerRef.current.clearLayers();
    connectionsLayerRef.current.clearLayers();

    const displaySystems = filteredSystems;

    displaySystems.forEach(system => {
      const color = getAsColor(system.type);
      const marker = L.circleMarker([system.lat, system.lng], {
        color,
        fillColor: color,
        fillOpacity: 0.92,
        radius: 12,
        weight: 3,
        opacity: 1
      });

      marker.bindPopup(`
        <div class="popup-card">
          <h6>${system.label}</h6>
          <p>${system.org}</p>
          <small>${getTypeLabel(system.type)}</small>
        </div>
      `, { maxWidth: 280, className: 'custom-popup' });

      marker.on('click', () => {
        setSelectedAsn(system.asn);
        mapRef.current?.setView([system.lat, system.lng], 5, { animate: true });
      });

      marker.bindTooltip(`${system.label} - ${system.org}`, { direction: 'top', offset: [0, -8] });
      marker.addTo(markersLayerRef.current);
    });

    if (showConnections) {
      displaySystems.forEach(system => {
        const peers = connectionFilter === 'upstream' ? system.upstreams : connectionFilter === 'peer' ? system.peers : [...system.upstreams, ...system.peers];

        peers.forEach(connectionValue => {
          const asn = parseAsNumber(connectionValue);
          const connected = systems.find(item => Number(item.asn) === asn);

          if (!connected || connected.asn === system.asn) {
            return;
          }

          L.polyline([[system.lat, system.lng], [connected.lat, connected.lng]], {
            color: selectedSystem && Number(selectedSystem.asn) === Number(system.asn) ? '#ff5c5c' : getAsColor(system.type),
            weight: selectedSystem && Number(selectedSystem.asn) === Number(system.asn) ? 3 : 1.5,
            opacity: 0.75,
            dashArray: '5, 5'
          }).addTo(connectionsLayerRef.current);
        });
      });
    }

    if (filteredSystems.length > 0) {
      const bounds = L.latLngBounds(filteredSystems.map(system => [system.lat, system.lng]));
      mapRef.current.fitBounds(bounds, { padding: [24, 24] });
    }
  }, [connectionFilter, filteredSystems, selectedSystem, showConnections, systems]);

  return (
    <main className="page-shell container-wide page-stack">
      <header className="page-hero card">
        <span className="badge">Mapa interativo</span>
        <h1>Mapa Interativo de Topologia BGP</h1>
        <p>Explore conexões entre AS, filtre por região e acompanhe a topologia no mesmo tema visual do site.</p>
      </header>

      <section className="card page-section map-controls">
        <input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} type="text" placeholder="Buscar ASN ou organização..." />
        <select value={regionFilter} onChange={event => setRegionFilter(event.target.value)}>
          <option value="">Todas as regiões</option>
          <option value="BR">Brasil</option>
          <option value="US">Estados Unidos</option>
          <option value="EU">Europa</option>
          <option value="AS">Ásia</option>
          <option value="SA">América do Sul</option>
        </select>
        <select value={connectionFilter} onChange={event => setConnectionFilter(event.target.value)}>
          <option value="">Todos os tipos</option>
          <option value="upstream">Upstreams</option>
          <option value="peer">Peers</option>
          <option value="customer">Customers</option>
        </select>
        <div className="button-row">
          <button type="button" className="btn btn-outline" onClick={() => setShowConnections(value => !value)}>
            {showConnections ? 'Ocultar Conexões' : 'Mostrar Conexões'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setShowLegend(value => !value)}>
            {showLegend ? 'Ocultar Legenda' : 'Legenda'}
          </button>
        </div>
      </section>

      <section className="map-layout">
        <div className="card map-stage">
          <div ref={mapContainerRef} id="mapView" />
        </div>

        <aside className="stack-gap">
          <div className={`card info-card${selectedSystem ? '' : ' empty-card'}`}>
            <div className="card-head">
              <span className="pill tone-primary">{selectedSystem ? getTypeLabel(selectedSystem.type) : 'Sem seleção'}</span>
            </div>
            {selectedSystem ? (
              <div className="info-stack">
                <h2>{getSystemTitle(selectedSystem)}</h2>
                <p>{selectedSystem.description}</p>
                <div className="info-grid">
                  <div><strong>País</strong><span>{getCountryLabel(selectedSystem.country)}</span></div>
                  <div><strong>Rotas</strong><span>{selectedSystem.routes}</span></div>
                  <div><strong>Prefixos</strong><span>{selectedSystem.prefixes.length}</span></div>
                  <div><strong>Conexões</strong><span>{selectedSystem.connections.length}</span></div>
                </div>
                <div className="chip-row">
                  <Link className="btn btn-primary" to={`/as/${selectedSystem.asn}`}>Ver detalhes</Link>
                </div>
              </div>
            ) : (
              <p className="muted-line">Clique em um marcador para ver as informações do AS.</p>
            )}
          </div>

          {showLegend ? (
            <div className="card legend-card">
              <h3>Legenda</h3>
              <div className="legend-list">
                <div className="legend-item"><span className="legend-dot bg-primary" /> Transit Provider</div>
                <div className="legend-item"><span className="legend-dot bg-success" /> Content Provider</div>
                <div className="legend-item"><span className="legend-dot bg-warning" /> Enterprise</div>
                <div className="legend-item"><span className="legend-line line-upstream" /> Upstream</div>
                <div className="legend-item"><span className="legend-line line-peer" /> Peer</div>
                <div className="legend-item"><span className="legend-line line-downstream" /> Downstream</div>
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}