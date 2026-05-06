import { geoRouteApi } from './api.js';
import { normalizeText, getCountryLabel } from './utils.js';

function createBadge(result) {
  const badge = document.createElement('span');
  badge.className = `badge ${result.type === 'transit' ? 'bg-primary' : 'bg-info'}`;
  badge.textContent = result.type === 'transit' ? 'Transit' : 'Enterprise';
  return badge;
}

function createMetaLine(label, value) {
  const line = document.createElement('p');
  line.className = 'mb-1';

  const strong = document.createElement('strong');
  strong.textContent = `${label}: `;
  line.appendChild(strong);
  line.appendChild(document.createTextNode(value));

  return line;
}

function createResultCard(result) {
  const card = document.createElement('div');
  card.className = 'card mb-3';

  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';

  const layout = document.createElement('div');
  layout.className = 'd-flex justify-content-between align-items-start';

  const content = document.createElement('div');
  content.className = 'flex-grow-1';

  const header = document.createElement('div');
  header.className = 'd-flex align-items-center mb-2 flex-wrap gap-2';

  const title = document.createElement('h3');
  title.className = 'h5 mb-0 me-2';

  const titleLink = document.createElement('a');
  titleLink.href = `as_detail.html?asn=${result.asn}`;
  titleLink.className = 'text-decoration-none text-primary';
  titleLink.textContent = `${result.asn} - ${result.org}`;
  title.appendChild(titleLink);

  header.appendChild(title);
  header.appendChild(createBadge(result));

  const country = document.createElement('p');
  country.className = 'text-muted mb-2';
  const flag = document.createElement('span');
  flag.className = `flag-icon flag-icon-${String(result.country || '').toLowerCase()}`;
  flag.setAttribute('aria-hidden', 'true');
  country.appendChild(flag);
  country.appendChild(document.createTextNode(` ${getCountryLabel(result.country)}`));

  const infoRow = document.createElement('div');
  infoRow.className = 'row';

  const prefixesColumn = document.createElement('div');
  prefixesColumn.className = 'col-md-6';
  const prefixesTitle = document.createElement('p');
  prefixesTitle.className = 'mb-1';
  const prefixesStrong = document.createElement('strong');
  prefixesStrong.textContent = 'Prefixos:';
  prefixesTitle.appendChild(prefixesStrong);
  const prefixesPreview = document.createElement('small');
  prefixesPreview.className = 'text-muted d-block';
  const prefixes = Array.isArray(result.prefixes) ? result.prefixes : [];
  prefixesPreview.textContent = prefixes.slice(0, 3).join(', ') + (prefixes.length > 3 ? '...' : '');
  prefixesColumn.appendChild(prefixesTitle);
  prefixesColumn.appendChild(prefixesPreview);

  const statsColumn = document.createElement('div');
  statsColumn.className = 'col-md-6';
  const routesValue = Number(result.routes || 0);
  const upstreams = Array.isArray(result.upstreams) ? result.upstreams : [];
  const peers = Array.isArray(result.peers) ? result.peers : [];
  statsColumn.appendChild(createMetaLine('Rotas ativas', routesValue));
  statsColumn.appendChild(createMetaLine('Upstreams', upstreams.length));
  statsColumn.appendChild(createMetaLine('Peers', peers.length));

  infoRow.appendChild(prefixesColumn);
  infoRow.appendChild(statsColumn);

  content.appendChild(header);
  content.appendChild(country);
  content.appendChild(infoRow);

  const actions = document.createElement('div');
  actions.className = 'text-end ms-3';

  const detailsLink = document.createElement('a');
  detailsLink.href = `as_detail.html?asn=${result.asn}`;
  detailsLink.className = 'btn btn-outline-primary btn-sm';
  detailsLink.textContent = 'Ver Detalhes';
  actions.appendChild(detailsLink);

  layout.appendChild(content);
  layout.appendChild(actions);
  cardBody.appendChild(layout);
  card.appendChild(cardBody);

  return card;
}

function showMessage(container, type, message) {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  container.appendChild(alert);
}

function renderResults(results, container) {
  container.replaceChildren();

  if (results.length === 0) {
    showMessage(container, 'danger', 'Nenhum resultado encontrado para a busca informada.');
    return;
  }

  const fragment = document.createDocumentFragment();
  results.forEach(result => {
    fragment.appendChild(createResultCard(result));
  });

  container.appendChild(fragment);
}

async function performSearch() {
  const queryInput = document.getElementById('queryInput');
  const resultsContainer = document.getElementById('results');
  const query = normalizeText(queryInput.value);

  resultsContainer.replaceChildren();

  if (!query) {
    showMessage(resultsContainer, 'warning', 'Digite um termo para buscar.');
    return;
  }

  try {
    const records = await geoRouteApi.listAS();
    const results = records.filter(item => {
      const asnText = normalizeText(item.asn);
      const labelText = normalizeText(item.label || `AS${item.asn}`);
      const orgText = normalizeText(item.org);
      const countryText = normalizeText(item.country);
      const typeText = normalizeText(item.type);
      const prefixes = Array.isArray(item.prefixes) ? item.prefixes : [];

      return (
        asnText.includes(query) ||
        labelText.includes(query) ||
        orgText.includes(query) ||
        countryText.includes(query) ||
        typeText.includes(query) ||
        prefixes.some(prefix => normalizeText(prefix).includes(query))
      );
    });

    renderResults(results, resultsContainer);
  } catch (error) {
    showMessage(resultsContainer, 'danger', `Erro ao buscar dados: ${error.message}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  const queryInput = document.getElementById('queryInput');

  searchBtn.addEventListener('click', performSearch);

  queryInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      performSearch();
    }
  });

  document.querySelectorAll('.as-quick-link').forEach(button => {
    button.addEventListener('click', event => {
      queryInput.value = event.currentTarget.dataset.asn || '';
      performSearch();
    });
  });
});