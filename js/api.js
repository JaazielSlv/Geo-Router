export const API_BASE_URL = 'http://localhost:3000/autonomousSystems';
export const FALLBACK_DATABASE_URL = new URL('../db/db.json', window.location.href).href;

export class GeoRouteApi {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(path = '', options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      const error = new Error(`Falha na requisição: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  async loadFallbackDatabase() {
    const response = await fetch(FALLBACK_DATABASE_URL);

    if (!response.ok) {
      const error = new Error(`Falha ao carregar db.json: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  listAS() {
    return this.request().catch(async error => {
      if (error instanceof TypeError) {
        const database = await this.loadFallbackDatabase();
        return database.autonomousSystems || [];
      }

      throw error;
    });
  }

  getAS(id) {
    return this.request(`/${id}`).catch(async error => {
      if (error instanceof TypeError) {
        const database = await this.loadFallbackDatabase();
        return (database.autonomousSystems || []).find(item => String(item.id) === String(id) || String(item.asn) === String(id)) || null;
      }

      throw error;
    });
  }

  createAS(payload) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  updateAS(id, payload) {
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  patchAS(id, payload) {
    return this.request(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  }

  deleteAS(id) {
    return this.request(`/${id}`, {
      method: 'DELETE'
    });
  }
}

export const geoRouteApi = new GeoRouteApi(API_BASE_URL);

if (typeof window !== 'undefined') {
  window.geoRouteApi = geoRouteApi;
}