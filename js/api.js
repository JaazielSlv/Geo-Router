export const API_BASE_URL = '/api/autonomousSystems';

export class GeoRouteApi {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  buildHeaders(additionalHeaders = {}) {
    return {
      'Content-Type': 'application/json',
      ...additionalHeaders
    };
  }

  async request(path = '', options = {}) {
    const { headers: extraHeaders, ...rest } = options;
    const headers = this.buildHeaders(extraHeaders);

    const response = await fetch(`${this.baseUrl}${path}`, {
      headers,
      ...rest
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

  listAS() {
    return this.request();
  }

  getAS(id) {
    return this.request(`/${id}`);
  }

  createAS(payload, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request('', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
  }

  updateAS(id, payload, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request(`/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload)
    });
  }

  patchAS(id, payload, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request(`/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload)
    });
  }

  deleteAS(id, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request(`/${id}`, {
      method: 'DELETE',
      headers
    });
  }

  async login(email, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = new Error(`Falha na requisição: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  async getDashboardSummary() {
    const response = await fetch('/api/dashboard/summary', {
      headers: this.buildHeaders()
    });

    if (!response.ok) {
      const error = new Error(`Falha na requisição: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  }
}

export const geoRouteApi = new GeoRouteApi(API_BASE_URL);

if (typeof window !== 'undefined') {
  window.geoRouteApi = geoRouteApi;
}