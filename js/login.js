import { geoRouteApi } from './api.js';

const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');

function showMessage(message, type = 'danger') {
  loginStatus.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('georoute_admin_token');
  if (token) {
    window.location.href = 'admin.html';
    return;
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
      const response = await geoRouteApi.login(email, password);
      localStorage.setItem('georoute_admin_token', response.token);
      showMessage('Login bem-sucedido! Redirecionando...', 'success');
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 800);
    } catch (error) {
      showMessage('Falha no login. Verifique credenciais e tente novamente.', 'danger');
    }
  });
});
