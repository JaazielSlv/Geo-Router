process.env.NODE_ENV = 'test';

import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';

test('invalid login payload returns validation errors', async () => {
  const server = app.listen(0);

  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' })
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, 'Dados inválidos.');
    assert.ok(Array.isArray(body.details));
    assert.ok(body.details.some((detail) => detail.msg.includes('Email inválido') || detail.msg.includes('Senha é obrigatória')));
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
