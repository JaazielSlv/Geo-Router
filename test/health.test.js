import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';

test('health endpoint returns ok', async () => {
  const server = app.listen(0);

  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const response = await fetch(`${baseUrl}/api/health`);

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body, { status: 'ok' });
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
