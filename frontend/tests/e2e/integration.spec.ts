import { randomBytes, randomInt, randomUUID } from 'node:crypto';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { z } from 'zod';

const AUTH_HEADERS = { 'X-Requested-With': 'XMLHttpRequest' };
const sessionSchema = z.object({ accessToken: z.string(), user: z.object({ id: z.string(), role: z.string() }) });
const bookSchema = z.object({ id: z.string(), title: z.string(), availableCopies: z.number() });
interface Account { id: string; email: string; password: string; token: string }

async function registerReader(request: APIRequestContext): Promise<Account> {
  const email = `browser-${randomUUID()}@example.test`;
  const password = randomBytes(24).toString('base64url');
  const response = await request.post('/api/v1/auth/register', {
    headers: AUTH_HEADERS, data: { name: 'Browser validation', email, password },
  });
  expect(response.status()).toBe(201);
  const session = sessionSchema.parse(await response.json());
  expect(session.user.role).toBe('READER');
  return { id: session.user.id, email, password, token: session.accessToken };
}

async function administratorToken(request: APIRequestContext): Promise<string> {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Integrated tests require BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD in the process environment.');
  const response = await request.post('/api/v1/auth/login', { headers: AUTH_HEADERS, data: { email, password } });
  expect(response.status()).toBe(200);
  const session = sessionSchema.parse(await response.json());
  expect(session.user.role).toBe('ADMIN');
  return session.accessToken;
}

async function signIn(page: Page, account: Account): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill(account.email);
  await page.getByLabel('Senha', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Olá, Browser' })).toBeVisible();
}

async function deactivate(request: APIRequestContext, session: { admin: string; account: Account }): Promise<void> {
  const response = await request.patch(`/api/v1/users/${session.account.id}/status`, {
    headers: { Authorization: `Bearer ${session.admin}` }, data: { active: false },
  });
  expect(response.status()).toBe(200);
  expect((await request.post('/api/v1/auth/logout', { headers: AUTH_HEADERS })).status()).toBe(204);
}

function validIsbn(): string {
  const base = `978${randomInt(1_000_000_000).toString().padStart(9, '0')}`;
  const weighted = [...base].reduce((sum, digit, index) => sum + Number(digit) * (index % 2 === 0 ? 1 : 3), 0);
  return `${base}${(10 - weighted % 10) % 10}`;
}

test('real services: login, catalog CRUD, refresh after reload and logout', async ({ page, request }) => {
  const account = await registerReader(request);
  const admin = await administratorToken(request);
  const headers = { Authorization: `Bearer ${admin}` };
  const promoted = await request.patch(`/api/v1/users/${account.id}/role`, { headers, data: { role: 'LIBRARIAN' } });
  expect(promoted.status()).toBe(200);
  let createdId: string | undefined;
  try {
    await signIn(page, account);
    await page.goto('/books');
    await page.getByRole('button', { name: 'Novo livro' }).click();
    const title = `Browser catalog ${randomUUID()}`;
    await page.getByLabel('Título', { exact: true }).fill(title);
    await page.getByLabel('Autor', { exact: true }).fill('Integration validation');
    await page.getByLabel('ISBN', { exact: true }).fill(validIsbn());
    const creation = page.waitForResponse(response => response.url().endsWith('/api/v1/books') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Salvar livro' }).click();
    const created = await creation;
    expect(created.status()).toBe(201);
    createdId = bookSchema.parse(await created.json()).id;
    await expect(page.getByText(title, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: `Visualizar ${title}` }).click();
    await expect(page.getByRole('dialog')).toContainText('Integration validation');
    await page.getByRole('button', { name: 'Fechar', exact: true }).click();
    await page.getByRole('button', { name: `Editar ${title}` }).click();
    await page.getByLabel('Exemplares disponíveis', { exact: true }).fill('0');
    await page.getByRole('button', { name: 'Salvar livro' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('row').filter({ hasText: title })).toContainText('Indisponível');
    await page.getByLabel('Pesquisar por título').fill(title);
    await page.getByRole('button', { name: 'Filtrar', exact: true }).click();
    await expect(page.getByText(title, { exact: true })).toBeVisible();
    const refreshed = page.waitForResponse(response => response.url().endsWith('/api/v1/auth/refresh'));
    await page.reload();
    expect((await refreshed).status()).toBe(200);
    await expect(page.getByText(title, { exact: true })).toBeVisible();
    const refreshCookie = (await page.context().cookies()).find(cookie => cookie.name === 'library_refresh');
    expect(refreshCookie?.httpOnly).toBe(true);
    await page.getByRole('button', { name: `Excluir ${title}` }).click();
    await page.getByRole('button', { name: 'Confirmar exclusão' }).click();
    await expect(page.getByText(title, { exact: true })).toHaveCount(0);
    expect((await request.get(`/api/v1/books/${createdId}`, { headers })).status()).toBe(404);
    await page.getByRole('button', { name: 'Sair', exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto('/books');
    await expect(page).toHaveURL(/\/login$/);
  } finally {
    if (createdId) {
      const cleanup = await request.delete(`/api/v1/books/${createdId}`, { headers });
      expect([204, 404]).toContain(cleanup.status());
    }
    await deactivate(request, { admin, account });
  }
});

test('real services: READER sees catalog without write or administrative privileges', async ({ page, request }) => {
  const account = await registerReader(request);
  const admin = await administratorToken(request);
  try {
    await signIn(page, account);
    await page.goto('/books');
    await expect(page.getByRole('heading', { name: 'Gerenciamento de livros' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Novo livro' })).toHaveCount(0);
    const forbidden = await request.post('/api/v1/books', { headers: { Authorization: `Bearer ${account.token}` }, data: {} });
    expect(forbidden.status()).toBe(403);
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: 'Acesso restrito' })).toBeVisible();
  } finally {
    await deactivate(request, { admin, account });
  }
});
