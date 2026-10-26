const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { mkdtemp, rm, stat } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const net = require('node:net');

// Exercise the real HTTP routes and native SQLite binding against a disposable database.
test('order lifecycle and validation survive dependency updates', { timeout: 20000 }, async (t) => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'dedamoroz-test-'));
  const database = path.join(temporary, 'orders.db');
  const listener = net.createServer();
  listener.listen(0, '127.0.0.1');
  await once(listener, 'listening');
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(port), DB_PATH: database,
      TELEGRAM_BOT_TOKEN: '', TELEGRAM_CHAT_ID: '', NODE_ENV: 'test' },
    stdio: 'ignore',
  });
  t.after(async () => {
    if (child.exitCode === null) {
      const exited = once(child, 'exit');
      child.kill('SIGTERM');
      await exited;
    }
    await rm(temporary, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { ready = (await fetch(base + '/health')).ok; } catch {}
    if (ready) break;
    assert.equal(child.exitCode, null, 'server exited during startup');
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.ok(ready, 'server should start');
  assert.ok((await stat(database)).isFile(), 'DB_PATH must select the temporary database');
  const request = (url, method, body) => fetch(base + url, {
    method, headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  assert.equal((await request('/api/orders', 'POST', {})).status, 400);
  const response = await request('/api/orders', 'POST', {
    name: 'Test visitor', address: 'Test street 12', phone: '+79990000000',
    datetime: new Date(Date.now() + 86400000).toISOString(),
  });
  assert.equal(response.status, 201);
  const created = (await response.json()).data;
  assert.ok(created.id > 0);
  const read = await (await fetch(`${base}/api/orders/${created.id}`)).json();
  assert.equal(read.data.name, 'Test visitor');
  assert.equal((await request(`/api/orders/${created.id}/status`, 'PATCH', { status: 'confirmed' })).status, 200);
  const updated = await (await fetch(`${base}/api/orders/${created.id}`)).json();
  assert.equal(updated.data.status, 'confirmed');
  assert.equal((await request(`/api/orders/${created.id}`, 'DELETE')).status, 200);
  assert.equal((await fetch(`${base}/api/orders/${created.id}`)).status, 404);
});
