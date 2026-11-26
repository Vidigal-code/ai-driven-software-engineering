import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';

const apiOrigin = process.env.BASE_URL ?? `http://localhost:${process.env.BACKEND_PORT ?? '8080'}`;
const frontendOrigin = process.env.FRONTEND_URL ?? `http://localhost:${process.env.FRONTEND_PORT ?? '3000'}`;
const results = [];
const startedAt = new Date().toISOString();
const start = performance.now();

function session() {
  return { token: '', cookie: '' };
}

async function request(client, options) {
  const headers = { 'X-Requested-With': 'XMLHttpRequest' };
  if (client.token) headers.Authorization = `Bearer ${client.token}`;
  if (client.cookie) headers.Cookie = client.cookie;
  if (options.body) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${apiOrigin}${options.path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(15_000),
  });
  const refreshCookie = response.headers.getSetCookie().find((cookie) => cookie.startsWith('library_refresh='));
  if (refreshCookie) client.cookie = refreshCookie.split(';')[0];
  assert.equal(response.status, options.status, `${options.method ?? 'GET'} ${options.path}: expected HTTP ${options.status}, received ${response.status}`);
  const body = response.status === 204 ? undefined : await response.json();
  if (body?.accessToken) client.token = body.accessToken;
  return body;
}

function record(name) {
  results.push({ name, status: 'passed', elapsedMs: Math.round(performance.now() - start) });
  console.log(`PASS ${name}`);
}

function createBook() {
  const digits = `978${String(Date.now()).slice(-9)}`;
  const sum = [...digits].reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3), 0);
  return {
    title: `Integration smoke ${Date.now()}`,
    author: 'Library validation',
    isbn: `${digits}${(10 - sum % 10) % 10}`,
    publisher: 'Local validation',
    publicationYear: new Date().getUTCFullYear(),
    category: 'Validation',
    description: 'Temporary record created by the integrated HTTP smoke test.',
    totalCopies: 3,
    availableCopies: 2,
  };
}

async function run() {
  const anonymous = session();
  const health = await request(anonymous, { path: '/actuator/health', status: 200 });
  assert.equal(health.status, 'UP');
  record('Health reports UP');

  const frontend = await fetch(frontendOrigin, { signal: AbortSignal.timeout(15_000) });
  assert.equal(frontend.status, 200, 'Frontend responds with HTTP 200');
  assert.match(await frontend.text(), /<div id="root"><\/div>/);
  record('Compiled frontend is served');

  const openapi = await request(anonymous, { path: '/v3/api-docs', status: 200 });
  assert.ok(openapi.paths['/api/v1/books']);
  assert.ok(openapi.components.securitySchemes);
  record('OpenAPI includes books and security scheme');

  await request(anonymous, { path: '/api/v1/books', status: 401 });
  record('Anonymous catalog access is denied');

  const reader = session();
  const credentials = {
    name: 'Integration Reader',
    email: `smoke-${randomBytes(6).toString('hex')}@example.test`,
    password: randomBytes(24).toString('base64url'),
  };
  const registered = await request(reader, { path: '/api/v1/auth/register', method: 'POST', body: credentials, status: 201 });
  assert.equal(registered.user.role, 'READER');
  assert.ok(reader.cookie.startsWith('library_refresh='));
  await request(reader, { path: '/api/v1/auth/login', method: 'POST', body: { email: credentials.email, password: credentials.password }, status: 200 });
  const me = await request(reader, { path: '/api/v1/auth/me', status: 200 });
  assert.equal(me.email, credentials.email);
  record('Registration, login and current user');

  const book = createBook();
  await request(reader, { path: '/api/v1/books', method: 'POST', body: book, status: 403 });
  await request(reader, { path: '/api/v1/users', status: 403 });
  record('READER cannot create books or administer users');

  const admin = session();
  assert.ok(process.env.BOOTSTRAP_ADMIN_EMAIL && process.env.BOOTSTRAP_ADMIN_PASSWORD, 'Smoke requires explicitly configured BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD');
  const signedIn = await request(admin, {
    path: '/api/v1/auth/login', method: 'POST', status: 200,
    body: { email: process.env.BOOTSTRAP_ADMIN_EMAIL, password: process.env.BOOTSTRAP_ADMIN_PASSWORD },
  });
  assert.equal(signedIn.user.role, 'ADMIN');
  record('Explicit administrator can authenticate');

  try {
    await validateLibraryAndSessions({ admin, reader, registered, credentials, book });
  } finally {
    const inactive = await request(admin, { path: `/api/v1/users/${registered.user.id}/status`, method: 'PATCH', body: { active: false }, status: 200 });
    assert.equal(inactive.active, false, 'The disposable reader account is deactivated');
  }
}

async function validateLibraryAndSessions(context) {
  const { admin, reader, registered, credentials, book } = context;
  const created = await request(admin, { path: '/api/v1/books', method: 'POST', body: book, status: 201 });
  assert.equal(created.isbn, book.isbn);
  try {
    await request(admin, { path: '/api/v1/books', method: 'POST', body: book, status: 409 });
    const page = await request(reader, { path: `/api/v1/books?isbn=${book.isbn}&page=0&size=5&sort=title,asc`, status: 200 });
    assert.ok(page.content.some((item) => item.id === created.id));
    const detail = await request(reader, { path: `/api/v1/books/${created.id}`, status: 200 });
    assert.equal(detail.availableCopies, 2);
    const updated = await request(admin, { path: `/api/v1/books/${created.id}`, method: 'PUT', body: { ...book, availableCopies: 1 }, status: 200 });
    assert.equal(updated.availableCopies, 1);
    await request(admin, { path: '/api/v1/books', method: 'POST', body: { ...book, title: '', isbn: 'invalid' }, status: 400 });
    record('Book create, duplicate rejection, search, detail, update and validation');

    const summary = await request(reader, { path: '/api/v1/dashboard/summary', status: 200 });
    assert.ok(summary.totalTitles >= 1);
    assert.ok(summary.totalCopies >= 3);
    assert.equal(summary.availableCopies + summary.unavailableCopies, summary.totalCopies);
    record('Dashboard reflects persisted inventory');

    const users = await request(admin, { path: '/api/v1/users?page=0&size=20', status: 200 });
    assert.ok(Array.isArray(users.content));
    const user = await request(admin, { path: `/api/v1/users/${registered.user.id}`, status: 200 });
    assert.equal(user.email, credentials.email);
    await request(admin, { path: `/api/v1/users/${user.id}/role`, method: 'PATCH', body: { role: 'READER' }, status: 200 });
    await request(admin, { path: `/api/v1/users/${user.id}/status`, method: 'PATCH', body: { active: true }, status: 200 });
    record('Administrator user listing and updates');
  } finally {
    await request(admin, { path: `/api/v1/books/${created.id}`, method: 'DELETE', status: 204 });
  }
  await request(reader, { path: `/api/v1/books/${created.id}`, status: 404 });
  record('Book deletion is persisted');

  await request(reader, { path: '/api/v1/auth/refresh', method: 'POST', status: 401 });
  record('Administrative role and status updates revoke existing refresh sessions');
  await request(reader, { path: '/api/v1/auth/login', method: 'POST', body: { email: credentials.email, password: credentials.password }, status: 200 });
  const staleRefresh = { token: '', cookie: reader.cookie };
  await request(reader, { path: '/api/v1/auth/refresh', method: 'POST', status: 200 });
  assert.ok(reader.cookie !== staleRefresh.cookie, 'Refresh must rotate the session cookie');
  await request(staleRefresh, { path: '/api/v1/auth/refresh', method: 'POST', status: 401 });
  await request(reader, { path: '/api/v1/auth/refresh', method: 'POST', status: 401 });
  record('Refresh rotation and replay detection revoke the token family');
  await request(reader, { path: '/api/v1/auth/login', method: 'POST', body: { email: credentials.email, password: credentials.password }, status: 200 });
  await request(reader, { path: '/api/v1/auth/logout', method: 'POST', status: 204 });
  await request(reader, { path: '/api/v1/auth/refresh', method: 'POST', status: 401 });
  record('Logout revokes a fresh authenticated session');
}

function saveReport(status, error) {
  mkdirSync('artifacts', { recursive: true });
  writeFileSync('artifacts/smoke.json', JSON.stringify({ startedAt, durationMs: Math.round(performance.now() - start), status, results, error }, null, 2));
}

await run().then(() => saveReport('passed')).catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown smoke failure';
  saveReport('failed', message);
  console.error(message);
  process.exitCode = 1;
});
