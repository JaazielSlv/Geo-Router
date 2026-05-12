export const MAP_COORDINATES = {
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

export function normalizeText(value) {
  return String(value || '').trim().toUpperCase();
}

export function getCountryLabel(country) {
  const labels = {
    BR: 'Brasil',
    US: 'Estados Unidos',
    SE: 'Suécia',
    JP: 'Japão',
    EU: 'Europa',
    SA: 'América do Sul',
    AR: 'Argentina',
    CL: 'Chile',
    CO: 'Colômbia'
  };

  return labels[country] || country || 'Desconhecido';
}

export function getCountryEmoji(country) {
  const labels = {
    BR: '🇧🇷',
    US: '🇺🇸',
    SE: '🇸🇪',
    JP: '🇯🇵'
  };

  return labels[country] || '🌍';
}

export function normalizeAsn(value) {
  const rawValue = String(value || '').trim().toUpperCase();

  if (!rawValue) {
    return 'AS1';
  }

  return rawValue.startsWith('AS') ? rawValue : `AS${rawValue}`;
}

export function parseAsNumber(value) {
  const rawValue = String(value || '').trim().toUpperCase();
  return Number(rawValue.startsWith('AS') ? rawValue.slice(2) : rawValue);
}

export function parseListInput(value) {
  return String(value || '')
    .split(/[,\n]/)
    .map(item => item.trim())
    .filter(Boolean);
}

export function listToInputValue(items) {
  return Array.isArray(items) ? items.join(', ') : '';
}

export function buildRouteHistory(record) {
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

function normalizeConnections(values) {
  return Array.from(new Set((values || []).map(parseAsNumber).filter(Number.isFinite)));
}

export function normalizeSystem(record) {
  const asn = parseAsNumber(record.asn ?? record.id);
  const prefixes = Array.isArray(record.prefixes) ? [...record.prefixes] : [];
  const upstreams = Array.isArray(record.upstreams) ? [...record.upstreams] : [];
  const peers = Array.isArray(record.peers) ? [...record.peers] : [];
  const [lat, lng] = MAP_COORDINATES[asn] || [record.lat ?? 0, record.lng ?? 0];

  return {
    id: record.id ?? asn,
    asn,
    label: record.label || `AS${asn}`,
    org: record.org || record.name || `AS${asn}`,
    country: record.country || 'BR',
    type: record.type || 'enterprise',
    routes: Number(record.routes || prefixes.length * 100),
    prefixes,
    upstreams,
    peers,
    description: record.description || `Dados carregados do JSON local para ${record.org || `AS${asn}`}.`,
    lastUpdate: record.lastUpdate || 'Carregado do db.json',
    status: record.status || 'Ativo',
    lat: Number(record.lat ?? lat),
    lng: Number(record.lng ?? lng),
    routeHistory: Array.isArray(record.routeHistory) ? [...record.routeHistory] : buildRouteHistory(record),
    connections: normalizeConnections([...(upstreams || []), ...(peers || []), ...(Array.isArray(record.connections) ? record.connections : [])])
  };
}

export function systemToFormValues(system) {
  return {
    asn: system?.asn ? String(system.asn) : '',
    org: system?.org || '',
    country: system?.country || 'BR',
    type: system?.type || 'enterprise',
    routes: system?.routes ? String(system.routes) : '0',
    description: system?.description || '',
    status: system?.status || 'Ativo',
    lat: system?.lat ? String(system.lat) : '',
    lng: system?.lng ? String(system.lng) : '',
    prefixes: listToInputValue(system?.prefixes),
    upstreams: listToInputValue(system?.upstreams),
    peers: listToInputValue(system?.peers)
  };
}

export function getSystemTitle(system) {
  return `${system.asn} - ${system.org}`;
}

export function getTypeLabel(type) {
  return type === 'transit' ? 'Transit' : type === 'content' ? 'Content' : 'Enterprise';
}

export function getTypeTone(type) {
  return type === 'transit' ? 'primary' : type === 'content' ? 'success' : 'warning';
}

export function getAsnLabel(value) {
  return normalizeAsn(value).replace(/^AS/, 'AS');
}