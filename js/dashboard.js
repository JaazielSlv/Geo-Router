import { geoRouteApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const asTotal = document.getElementById('asTotal');
  const prefixTotal = document.getElementById('prefixTotal');
  const alertTotal = document.getElementById('alertTotal');
  const eventTotal = document.getElementById('eventTotal');

  try {
    const summary = await geoRouteApi.getDashboardSummary();
    asTotal.textContent = summary.totalAS ?? '0';
    prefixTotal.textContent = summary.totalPrefixes ?? '0';
    alertTotal.textContent = summary.activeAlerts ?? '0';
    eventTotal.textContent = summary.totalEvents ?? '0';
  } catch (error) {
    console.error('Erro ao carregar resumo do dashboard:', error);
    asTotal.textContent = '—';
    prefixTotal.textContent = '—';
    alertTotal.textContent = '—';
    eventTotal.textContent = '—';
  }
});
