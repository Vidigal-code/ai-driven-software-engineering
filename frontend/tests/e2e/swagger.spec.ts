import { createHash, randomBytes, randomInt, randomUUID } from 'node:crypto';
import { expect, test, type APIRequestContext, type APIResponse, type Locator, type Page, type Response } from '@playwright/test';
import { z } from 'zod';

const serversSchema = z.object({ servers: z.array(z.object({ url: z.string() })) });
const sessionSchema = z.object({
  accessToken: z.string(),
  user: z.object({ id: z.string(), role: z.string() }),
});
const bookSchema = z.object({ id: z.string(), title: z.string(), availableCopies: z.number() });
const AUTH_HEADERS = { 'X-Requested-With': 'XMLHttpRequest' };
const ISBN_PREFIX_LENGTH = 12;
test.afterEach(async ({ page }) => {
  await page.close();
});
interface SwaggerSession {
  adminToken: string;
  userId: string;
  email: string;
  password: string;
}
interface ExampleBook {
  id: string;
  title: string;
  input: Record<string, unknown>;
}

async function prepareLibrarian(request: APIRequestContext): Promise<SwaggerSession> {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Swagger integration requires administrator credentials in the process environment.');
  const login = await redactRequestFailure(request.post('/api/v1/auth/login', { headers: AUTH_HEADERS, data: { email, password } }));
  expect(login.status()).toBe(200);
  const admin = sessionSchema.parse(await login.json());
  expect(admin.user.role).toBe('ADMIN');
  expect((await redactRequestFailure(request.post('/api/v1/auth/logout', { headers: AUTH_HEADERS }))).status()).toBe(204);
  const account = {
    name: 'Swagger validation',
    email: `swagger-${randomUUID()}@example.test`,
    password: randomBytes(24).toString('base64url'),
  };
  const registration = await redactRequestFailure(request.post('/api/v1/auth/register', { headers: AUTH_HEADERS, data: account }));
  expect(registration.status()).toBe(201);
  const registered = sessionSchema.parse(await registration.json());
  const session = { adminToken: admin.accessToken, userId: registered.user.id, email: account.email, password: account.password };
  try {
    expect(registered.user.role).toBe('READER');
    const promoted = await redactRequestFailure(request.patch(`/api/v1/users/${registered.user.id}/role`, {
      headers: { Authorization: `Bearer ${admin.accessToken}` }, data: { role: 'LIBRARIAN' },
    }));
    expect(promoted.status()).toBe(200);
    return session;
  } catch (error) {
    try {
      await deactivateSession(request, session);
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'Disposable account promotion and cleanup failed.', { cause: cleanupError });
    }
    throw error;
  }
}

async function deactivateSession(request: APIRequestContext, session: SwaggerSession): Promise<void> {
  const headers = { Authorization: `Bearer ${session.adminToken}` };
  expect((await redactRequestFailure(request.patch(`/api/v1/users/${session.userId}/status`, { headers, data: { active: false } }))).status()).toBe(200);
  expect((await redactRequestFailure(request.post('/api/v1/auth/logout', { headers: AUTH_HEADERS }))).status()).toBe(204);
}

async function redactRequestFailure(response: Promise<APIResponse>): Promise<APIResponse> {
  try {
    return await response;
  } catch {
    throw new Error('Authenticated test request failed. Sensitive headers and body withheld; check service availability.');
  }
}

async function openOperation(page: Page, operationId: string): Promise<Locator> {
  const operation = page.locator(`[id$="-${operationId}"].opblock`);
  if (!await operation.getByRole('button', { name: 'Execute', exact: true }).isVisible()) {
    await operation.locator('.opblock-summary-control').click();
    await expect(operation.getByRole('button', { name: /^(Try it out|Cancel)$/ })).toBeVisible();
    const tryButton = operation.getByRole('button', { name: 'Try it out', exact: true });
    if (await tryButton.isVisible()) await tryButton.click();
  }
  return operation;
}

async function executeOperation(page: Page, operation: Locator, endpoint: { method: string; path: string }): Promise<Response> {
  const response = page.waitForResponse(candidate =>
    new URL(candidate.url()).pathname === endpoint.path && candidate.request().method() === endpoint.method,
    { timeout: 10_000 },
  );
  await operation.getByRole('button', { name: 'Execute', exact: true }).click();
  const result = await response;
  expect(new URL(result.url()).origin).toBe(new URL(page.url()).origin);
  return result;
}

async function authorize(page: Page, token: string): Promise<void> {
  await page.locator('.auth-wrapper').getByRole('button', { name: 'Authorize', exact: true }).click();
  const dialog = page.locator('.dialog-ux');
  const logout = dialog.getByRole('button', { name: 'Remove authorization', exact: true });
  if (await logout.isVisible()) await logout.click();
  await fillSensitive(dialog.getByLabel('auth-bearer-value'), token);
  await dialog.getByRole('button', { name: 'Apply credentials', exact: true }).click();
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
}

async function fillSensitive(control: Locator, value: string): Promise<void> {
  try {
    await control.fill(value);
  } catch {
    throw new Error('Unable to fill a sensitive Swagger field. Original input and browser call log withheld.');
  }
}

async function refreshCookieFingerprint(page: Page): Promise<string> {
  const cookie = (await page.context().cookies()).find(candidate => candidate.name === 'library_refresh');
  expect(cookie?.httpOnly).toBe(true);
  return createHash('sha256').update(cookie?.value ?? '').digest('hex');
}

function uniqueIsbn(): string {
  const prefix = `978${randomInt(1_000_000_000).toString().padStart(ISBN_PREFIX_LENGTH - 3, '0')}`;
  const weighted = [...prefix].reduce((sum, digit, index) => sum + Number(digit) * (index % 2 === 0 ? 1 : 3), 0);
  return `${prefix}${(10 - weighted % 10) % 10}`;
}

async function createBookFromExample(page: Page): Promise<ExampleBook> {
  const operation = await openOperation(page, 'createBook');
  const body = operation.locator('textarea.body-param__text');
  const example = z.record(z.string(), z.unknown()).parse(JSON.parse(await body.inputValue()));
  const title = `Swagger book ${randomUUID()}`;
  const input = { ...example, isbn: uniqueIsbn(), title };
  await body.fill(JSON.stringify(input));
  const response = await executeOperation(page, operation, { method: 'POST', path: '/api/v1/books' });
  expect(response.status()).toBe(201);
  return { id: bookSchema.parse(await response.json()).id, title, input };
}

async function verifyBookCrud(page: Page, created: ExampleBook): Promise<void> {
  const operation = await openOperation(page, 'createBook');
  expect((await executeOperation(page, operation, { method: 'POST', path: '/api/v1/books' })).status()).toBe(409);
  const details = await openOperation(page, 'getBook');
  await details.getByPlaceholder('id', { exact: true }).fill(created.id);
  const found = await executeOperation(page, details, { method: 'GET', path: `/api/v1/books/${created.id}` });
  expect(found.status()).toBe(200);
  expect(bookSchema.parse(await found.json()).title).toBe(created.title);
  const update = await openOperation(page, 'updateBook');
  await update.getByPlaceholder('id', { exact: true }).fill(created.id);
  await update.locator('textarea.body-param__text').fill(JSON.stringify({ ...created.input, availableCopies: 0 }));
  const updated = await executeOperation(page, update, { method: 'PUT', path: `/api/v1/books/${created.id}` });
  expect(updated.status()).toBe(200);
  expect(bookSchema.parse(await updated.json()).availableCopies).toBe(0);
  const remove = await openOperation(page, 'deleteBook');
  await remove.getByPlaceholder('id', { exact: true }).fill(created.id);
  expect((await executeOperation(page, remove, { method: 'DELETE', path: `/api/v1/books/${created.id}` })).status()).toBe(204);
  expect((await executeOperation(page, details, { method: 'GET', path: `/api/v1/books/${created.id}` })).status()).toBe(404);
}

test('Swagger publishes requests on the origin used by the browser', async ({ page, request }) => {
  const response = await request.get('/v3/api-docs');
  expect(response.status()).toBe(200);
  expect(serversSchema.parse(await response.json()).servers).toEqual([{ url: '/' }]);
  await page.goto('/swagger-ui/index.html');
  await expect(page.getByRole('heading', { name: /Library Management API/ })).toBeVisible();
});

test('Swagger examples support login, Authorize, complete CRUD, refresh and logout', async ({ page, request }) => {
  const session = await prepareLibrarian(request);
  const headers = { Authorization: `Bearer ${session.adminToken}` };
  let created: ExampleBook | undefined;
  try {
    await page.goto('/swagger-ui/index.html');
    const login = await openOperation(page, 'login');
    await expect(login.locator('tr[data-param-name="X-Requested-With"]').getByRole('combobox')).toHaveValue('XMLHttpRequest');
    await fillSensitive(login.locator('textarea.body-param__text'), JSON.stringify({ email: session.email, password: session.password }));
    const authenticated = await executeOperation(page, login, { method: 'POST', path: '/api/v1/auth/login' });
    expect(authenticated.status()).toBe(200);
    const access = sessionSchema.parse(await authenticated.json());
    expect(access.user.role).toBe('LIBRARIAN');
    await authorize(page, access.accessToken);
    created = await createBookFromExample(page);
    await verifyBookCrud(page, created);
    const before = await refreshCookieFingerprint(page);
    const refresh = await openOperation(page, 'refresh');
    await expect(refresh.getByPlaceholder('library_refresh')).toHaveCount(0);
    const renewed = await executeOperation(page, refresh, { method: 'POST', path: '/api/v1/auth/refresh' });
    expect(renewed.status()).toBe(200);
    await authorize(page, sessionSchema.parse(await renewed.json()).accessToken);
    expect(await refreshCookieFingerprint(page)).not.toBe(before);
    const logout = await openOperation(page, 'logout');
    expect((await executeOperation(page, logout, { method: 'POST', path: '/api/v1/auth/logout' })).status()).toBe(204);
    expect((await page.context().cookies()).some(cookie => cookie.name === 'library_refresh')).toBe(false);
  } finally {
    if (created) {
      expect([204, 404]).toContain((await redactRequestFailure(request.delete(`/api/v1/books/${created.id}`, { headers }))).status());
    }
    await deactivateSession(request, session);
  }
});
