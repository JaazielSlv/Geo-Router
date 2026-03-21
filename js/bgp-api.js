// Funções para integração com APIs BGP
class BGPAPI {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas
  }

  // Verificar se dados estão em cache e válidos
  getCachedData(key) {
    const cached = localStorage.getItem(`bgp_${key}`);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < this.cacheExpiry) {
        return data.value;
      } else {
        localStorage.removeItem(`bgp_${key}`);
      }
    }
    return null;
  }

  // Salvar dados no cache
  setCachedData(key, value) {
    const data = {
      value: value,
      timestamp: Date.now()
    };
    localStorage.setItem(`bgp_${key}`, JSON.stringify(data));
  }

  // Buscar upstreams de um AS usando BGPView
  async getUpstreams(asn) {
    const cacheKey = `upstreams_${asn}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`https://api.bgpview.io/asn/${asn}/upstreams`);
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      const upstreams = data.data?.ipv4_upstreams || [];
      this.setCachedData(cacheKey, upstreams);
      return upstreams;
    } catch (error) {
      console.error('Erro ao buscar upstreams:', error);
      return [];
    }
  }

  // Buscar peers de um AS
  async getPeers(asn) {
    const cacheKey = `peers_${asn}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`https://api.bgpview.io/asn/${asn}/peers`);
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      const peers = data.data?.ipv4_peers || [];
      this.setCachedData(cacheKey, peers);
      return peers;
    } catch (error) {
      console.error('Erro ao buscar peers:', error);
      return [];
    }
  }

  // Buscar downstreams de um AS
  async getDownstreams(asn) {
    const cacheKey = `downstreams_${asn}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`https://api.bgpview.io/asn/${asn}/downstreams`);
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      const downstreams = data.data?.ipv4_downstreams || [];
      this.setCachedData(cacheKey, downstreams);
      return downstreams;
    } catch (error) {
      console.error('Erro ao buscar downstreams:', error);
      return [];
    }
  }

  // Buscar detalhes do AS
  async getAsDetails(asn) {
    const cacheKey = `details_${asn}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`https://api.bgpview.io/asn/${asn}`);
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      this.setCachedData(cacheKey, data.data);
      return data.data;
    } catch (error) {
      console.error('Erro ao buscar detalhes do AS:', error);
      return null;
    }
  }
}

// Instância global da API
const bgpAPI = new BGPAPI();

// Função para obter coordenadas geográficas de um AS (simplificada para AS brasileiros)
function getAsCoordinates(asn) {
  // Coordenadas aproximadas para AS brasileiros conhecidos
  const coordinates = {
    28513: [-23.5505, -46.6333], // Claro - São Paulo
    27699: [-22.9068, -43.1729], // Telefônica/Vivo - Rio de Janeiro
    4230: [-15.7942, -47.8822], // Embratel - Brasília
    1916: [-23.5505, -46.6333], // Rede Nacional de Ensino e Pesquisa - São Paulo
    53006: [-8.0476, -34.8770], // Algar Telecom - Recife
    262287: [-3.7319, -38.5267], // Maxx Telecom - Fortaleza
    28186: [-12.9714, -38.5014], // ITS Telecom - Salvador
    14840: [-25.4284, -49.2673], // BR.Digital Provider - Curitiba
    263432: [-29.1685, -51.1792], // Unifique - Porto Alegre
    265680: [-19.9191, -43.9386], // Vivo - Belo Horizonte
    61678: [-23.5505, -46.6333], // Locaweb - São Paulo
    52532: [-22.9068, -43.1729], // SpeedyNet Telecom - Rio de Janeiro
    271180: [-3.7319, -38.5267], // Hotnet Telecom - Fortaleza
    267613: [-25.4284, -49.2673], // ELETRONET - Curitiba
    268580: [-29.1685, -51.1792], // BRASIL TECPAR - Porto Alegre
    3356: [39.7392, -104.9903], // Level 3 - Denver (EUA)
    1299: [59.3293, 18.0686], // Telia - Stockholm (Suécia)
    3257: [40.7128, -74.0060], // GTT - New York (EUA)
    6939: [37.7749, -122.4194], // Hurricane Electric - San Francisco (EUA)
    174: [38.9072, -77.0369], // Cogent - Washington DC (EUA)
    // Adicionar mais conforme necessário
  };
  return coordinates[asn] || [0, 0]; // Centro do mapa se não encontrado
}

// Função para determinar tipo de AS baseado em conexões
function determineAsType(upstreams, peers, downstreams) {
  const upstreamCount = upstreams.length;
  const peerCount = peers.length;
  const downstreamCount = downstreams.length;

  if (downstreamCount > upstreamCount + peerCount) {
    return 'transit'; // Provavelmente um transit provider
  } else if (peerCount > upstreamCount && downstreamCount < 5) {
    return 'content'; // Provavelmente content provider
  } else {
    return 'enterprise'; // Provavelmente enterprise
  }
}

// Função para carregar dados dinâmicos de AS
async function loadAsData(asn) {
  try {
    // Mostrar loading
    showLoadingStatus(`Carregando dados do AS${asn}...`);

    const [details, upstreams, peers, downstreams] = await Promise.all([
      bgpAPI.getAsDetails(asn),
      bgpAPI.getUpstreams(asn),
      bgpAPI.getPeers(asn),
      bgpAPI.getDownstreams(asn)
    ]);

    if (!details) {
      throw new Error('Não foi possível obter detalhes do AS');
    }

    const [lat, lng] = getAsCoordinates(asn);
    const type = determineAsType(upstreams, peers, downstreams);

    // Combinar todas as conexões
    const connections = [
      ...upstreams.map(u => ({ asn: u.asn, type: 'upstream' })),
      ...peers.map(p => ({ asn: p.asn, type: 'peer' })),
      ...downstreams.map(d => ({ asn: d.asn, type: 'downstream' }))
    ];

    const asData = {
      asn: asn,
      name: details.name || `AS${asn}`,
      lat: lat,
      lng: lng,
      type: type,
      region: 'BR', // Foco em brasileiros
      connections: connections
    };

    hideLoadingStatus();
    return asData;
  } catch (error) {
    console.error('Erro ao carregar dados do AS:', error);
    hideLoadingStatus();
    showErrorStatus('Erro ao carregar dados. Usando dados offline.');
    return getFallbackAsData(asn);
  }
}

// Dados de fallback para quando a API falha
function getFallbackAsData(asn) {
  const fallbackData = {
    28513: { asn: 28513, name: "Claro S.A.", lat: -23.5505, lng: -46.6333, type: "transit", region: "BR", connections: [3356, 1299, 3257] },
    27699: { asn: 27699, name: "Telecom Italia S.p.A.", lat: -22.9068, lng: -43.1729, type: "transit", region: "BR", connections: [3356, 1299] },
    // Adicionar mais fallbacks
  };
  return fallbackData[asn] || { asn: asn, name: `AS${asn}`, lat: 0, lng: 0, type: "enterprise", region: "BR", connections: [] };
}

// Funções para status de carregamento
function showLoadingStatus(message) {
  const statusDiv = document.getElementById('loadingStatus') || createStatusDiv();
  statusDiv.innerHTML = `<div class="alert alert-info"><i class="fas fa-spinner fa-spin"></i> ${message}</div>`;
  statusDiv.style.display = 'block';
}

function hideLoadingStatus() {
  const statusDiv = document.getElementById('loadingStatus');
  if (statusDiv) statusDiv.style.display = 'none';
}

function showErrorStatus(message) {
  const statusDiv = document.getElementById('errorStatus') || createStatusDiv();
  statusDiv.innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
  statusDiv.style.display = 'block';
  setTimeout(() => statusDiv.style.display = 'none', 5000);
}

function createStatusDiv() {
  const div = document.createElement('div');
  div.id = 'loadingStatus';
  div.style.position = 'fixed';
  div.style.top = '20px';
  div.style.right = '20px';
  div.style.zIndex = '1000';
  document.body.appendChild(div);
  return div;
}