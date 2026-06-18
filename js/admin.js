import { geoRouteApi } from './api.js';

const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');
const adminActions = document.getElementById('adminActions');
const refreshBtn = document.getElementById('refreshBtn');
const adminSearchInput = document.getElementById('adminSearchInput');
const adminSearchBtn = document.getElementById('adminSearchBtn');
const adminResults = document.getElementById('adminResults');
const summaryCards = document.getElementById('summaryCards');
const adminForm = document.getElementById('adminForm');
const adminMessage = document.getElementById('adminMessage');

const formAsn = document.getElementById('formAsn');
const formOrg = document.getElementById('formOrg');
const formCountry = document.getElementById('formCountry');
const formType = document.getElementById('formType');
const formRoutes = document.getElementById('formRoutes');
const formPrefixes = document.getElementById('formPrefixes');
const formUpstreams = document.getElementById('formUpstreams');
const formPeers = document.getElementById('formPeers');
const formDescription = document.getElementById('formDescription');
const createBtn = document.getElementById('createBtn');
const updateBtn = document.getElementById('updateBtn');
const deleteBtn = document.getElementById('deleteBtn');

let authToken = null;
let currentSelection = null;
let allASRecords = [];

function showMessage(message, type = 'success', container = adminMessage) {
  container.innerHTML = `\n    <div class="alert alert-${type} alert-dismissible fade show" role="alert">\n      ${message}\n      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>\n    </div>\n  `;
}

function clearMessage(container = adminMessage) {
  container.innerHTML = '';
}

function setAuthenticated(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('georoute_admin_token', token);
    adminActions.classList.remove('d-none');
    showMessage('Autenticação bem-sucedida. Agora você pode criar, atualizar ou excluir AS.', 'success', loginStatus);
  } else {
    localStorage.removeItem('georoute_admin_token');
    adminActions.classList.add('d-none');
  }
}

function getStoredToken() {
  return localStorage.getItem('georoute_admin_token');
}

function buildAsCard(asRecord) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-outline-secondary btn-sm mt-2';
  button.textContent = `Editar AS${asRecord.asn}`;
  button.addEventListener('click', () => populateForm(asRecord));

  const card = document.createElement('div');
  card.className = 'card mb-3 shadow-sm';
  card.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h5 class="card-title mb-1">AS${asRecord.asn} - ${asRecord.org}</h5>
          <p class="mb-1 text-muted">País: ${asRecord.country || 'N/A'} • Tipo: ${asRecord.type || 'N/A'}</p>
          <p class="mb-0"><strong>Prefixos:</strong> ${Array.isArray(asRecord.prefixes) ? asRecord.prefixes.length : 0}</p>
        </div>
      </div>
    </div>
  `;
  card.querySelector('.card-body').appendChild(button);
  return card;
}

function renderSummaryCards(summary) {
  if (!summaryCards) return;

  summaryCards.innerHTML = `
    <div class="col-12 col-md-6 col-lg-3">
      <div class="card text-center shadow-sm">
        <div class="card-body">
          <div class="text-muted small">AS monitorados</div>
          <div class="h4">${summary.totalAS ?? 0}</div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 col-lg-3">
      <div class="card text-center shadow-sm">
        <div class="card-body">
          <div class="text-muted small">Prefixos ativos</div>
          <div class="h4">${summary.totalPrefixes ?? 0}</div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 col-lg-3">
      <div class="card text-center shadow-sm">
        <div class="card-body">
          <div class="text-muted small">Upstreams</div>
          <div class="h4">${summary.totalUpstreams ?? 0}</div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 col-lg-3">
      <div class="card text-center shadow-sm">
        <div class="card-body">
          <div class="text-muted small">Peers</div>
          <div class="h4">${summary.totalPeers ?? 0}</div>
        </div>
      </div>
    </div>
  `;
}

function renderAdminResults(records) {
  adminResults.innerHTML = '';
  if (!records.length) {
    adminResults.innerHTML = '<div class="alert alert-warning">Nenhum registro encontrado.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  records.forEach(record => fragment.appendChild(buildAsCard(record)));
  adminResults.appendChild(fragment);
}

function populateForm(record) {
  currentSelection = record;
  formAsn.value = record.asn || '';
  formOrg.value = record.org || '';
  formCountry.value = record.country || 'BR';
  formType.value = record.type || 'transit';
  formRoutes.value = record.routes || 0;
  formPrefixes.value = Array.isArray(record.prefixes) ? record.prefixes.join(', ') : '';
  formUpstreams.value = Array.isArray(record.upstreams) ? record.upstreams.join(', ') : '';
  formPeers.value = Array.isArray(record.peers) ? record.peers.join(', ') : '';
  formDescription.value = record.description || '';
  showMessage(`Registro AS${record.asn} carregado no formulário. Use Atualizar ou Excluir.`, 'info');
}

function getFormData() {
  return {
    asn: Number(formAsn.value),
    org: formOrg.value.trim(),
    country: formCountry.value.trim(),
    type: formType.value,
    routes: Number(formRoutes.value) || 0,
    prefixes: formPrefixes.value.split(',').map(item => item.trim()).filter(Boolean),
    upstreams: formUpstreams.value.split(',').map(item => item.replace(/AS/i, '').trim()).filter(Boolean).map(Number),
    peers: formPeers.value.split(',').map(item => item.replace(/AS/i, '').trim()).filter(Boolean).map(Number),
    description: formDescription.value.trim()
  };
}

async function refreshData() {
  try {
    clearMessage();
    allASRecords = await geoRouteApi.listAS();
    renderAdminResults(allASRecords);
    showMessage('Dados de AS carregados com sucesso.', 'success');
  } catch (error) {
    showMessage(`Erro ao carregar AS: ${error.message}`, 'danger');
  }
}

async function loadSummary() {
  try {
    const summary = await geoRouteApi.getDashboardSummary();
    renderSummaryCards(summary);
  } catch (error) {
    console.error('Falha ao carregar resumo:', error);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await geoRouteApi.login(email, password);
    setAuthenticated(response.token);
    await loadSummary();
    await refreshData();
  } catch (error) {
    showMessage('Falha no login. Verifique credenciais e tente novamente.', 'danger', loginStatus);
  }
}

function restoreSession() {
  const token = getStoredToken();
  if (token) {
    setAuthenticated(token);
  }
}

async function handleCreate(event) {
  event.preventDefault();
  if (!authToken) {
    showMessage('Autenticação necessária para criar AS.', 'warning');
    return;
  }

  const payload = getFormData();
  try {
    await geoRouteApi.createAS(payload, authToken);
    await refreshData();
    showMessage('AS criado com sucesso.', 'success');
    adminForm.reset();
  } catch (error) {
    showMessage(`Erro ao criar AS: ${error.message}`, 'danger');
  }
}

async function handleUpdate() {
  if (!authToken) {
    showMessage('Autenticação necessária para atualizar AS.', 'warning');
    return;
  }

  const payload = getFormData();
  const targetAsn = currentSelection ? currentSelection.asn : Number(formAsn.value);

  if (!targetAsn) {
    showMessage('Informe um ASN válido para atualizar.', 'warning');
    return;
  }

  try {
    await geoRouteApi.updateAS(targetAsn, payload, authToken);
    await refreshData();
    showMessage(`AS${targetAsn} atualizado com sucesso.`, 'success');
  } catch (error) {
    showMessage(`Erro ao atualizar AS: ${error.message}`, 'danger');
  }
}

async function handleDelete() {
  if (!authToken) {
    showMessage('Autenticação necessária para excluir AS.', 'warning');
    return;
  }

  const targetAsn = currentSelection ? currentSelection.asn : Number(formAsn.value);

  if (!targetAsn) {
    showMessage('Informe um ASN válido para excluir.', 'warning');
    return;
  }

  try {
    await geoRouteApi.deleteAS(targetAsn, authToken);
    await refreshData();
    adminForm.reset();
    currentSelection = null;
    showMessage(`AS${targetAsn} excluído com sucesso.`, 'success');
  } catch (error) {
    showMessage(`Erro ao excluir AS: ${error.message}`, 'danger');
  }
}

function handleSearch() {
  const query = adminSearchInput.value.trim().toLowerCase();
  if (!query) {
    renderAdminResults(allASRecords);
    return;
  }

  const filtered = allASRecords.filter(record => {
    const asnText = String(record.asn).toLowerCase();
    const orgText = String(record.org || '').toLowerCase();
    return asnText.includes(query) || orgText.includes(query);
  });
  renderAdminResults(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
  restoreSession();
  loginForm.addEventListener('submit', handleLogin);
  refreshBtn.addEventListener('click', refreshData);
  adminSearchBtn.addEventListener('click', handleSearch);
  adminSearchInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  });
  adminForm.addEventListener('submit', handleCreate);
  updateBtn.addEventListener('click', handleUpdate);
  deleteBtn.addEventListener('click', handleDelete);
  refreshData();
  loadSummary();
});
