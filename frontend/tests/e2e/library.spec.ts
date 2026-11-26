import { expect, test, type Page } from '@playwright/test';

const BOOK = {
  id: 'b1',
  title: 'Clean Code',
  author: 'Robert C. Martin',
  isbn: '9780132350884',
  publisher: 'Prentice Hall',
  publicationYear: 2008,
  category: 'Engenharia',
  description: 'Práticas de código limpo.',
  totalCopies: 3,
  availableCopies: 2,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};
const USER = {
  id: 'u1',
  name: 'Maria Silva',
  email: 'maria@example.test',
  role: 'ADMIN',
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

test('CA-UI-001: registers a reader without sending a privileged role', async ({ page }) => {
  await mockLibrary(page, 'VISITOR');
  await page.goto('/register');
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page.getByText('Informe seu nome.')).toBeVisible();
  await page.getByLabel('Nome', { exact: true }).fill('Maria Silva');
  await page.getByLabel('E-mail', { exact: true }).fill('maria@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('test-password-long');
  const submitted = page.waitForRequest(request => request.url().endsWith('/auth/register'));
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  expect((await submitted).postDataJSON()).not.toHaveProperty('role');
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('CA-UI-002a: displays loading, empty and recoverable error states', async ({ page }) => {
  await mockLibrary(page, 'READER');
  let responseMode: 'pending' | 'error' | 'empty' = 'pending';
  let release: (() => void) | undefined;
  await page.route('**/api/v1/books?**', async route => {
    if (responseMode === 'pending') await new Promise<void>(resolve => { release = resolve; });
    if (responseMode === 'error') return route.fulfill({ status: 503, json: { detail: 'Serviço temporariamente indisponível.' } });
    return route.fulfill({ json: { content: [], number: 0, size: 10, totalElements: 0, totalPages: 0 } });
  });
  await page.goto('/books');
  await expect(page.getByRole('heading', { name: 'Gerenciamento de livros' })).toBeVisible();
  await expect(page.getByLabel('Carregando dados')).toBeVisible();
  responseMode = 'error';
  release?.();
  await expect(page.getByRole('alert')).toContainText('Serviço temporariamente indisponível.');
  responseMode = 'empty';
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('heading', { name: 'Nenhum livro encontrado' })).toBeVisible();
});

test('CA-UI-003d: submits all filters and server ordering through the REST contract', async ({ page }) => {
  await mockLibrary(page, 'READER');
  await page.goto('/books');
  await page.getByLabel('Pesquisar por título').fill('Clean');
  await page.getByText('Mais filtros: autor, ISBN e categoria').click();
  await page.getByLabel('Filtrar autor').fill('Martin');
  await page.getByLabel('Filtrar ISBN').fill(BOOK.isbn);
  await page.getByLabel('Filtrar categoria').fill('Engenharia');
  await page.getByLabel('Disponibilidade', { exact: true }).selectOption('true');
  const filtered = page.waitForRequest(request => request.url().includes('author=Martin'));
  await page.getByRole('button', { name: 'Filtrar', exact: true }).click();
  const params = new URL((await filtered).url()).searchParams;
  expect(Object.fromEntries(params)).toMatchObject({ title: 'Clean', author: 'Martin', isbn: BOOK.isbn, category: 'Engenharia', available: 'true', page: '0', size: '10' });
  const sorted = page.waitForRequest(request => new URL(request.url()).searchParams.get('sort') === 'title,asc');
  await page.getByLabel('Ordenar livros').selectOption('title,asc');
  expect(new URL((await sorted).url()).searchParams.get('page')).toBe('0');
});

async function mockLibrary(
  page: Page,
  role: 'ADMIN' | 'LIBRARIAN' | 'READER' | 'VISITOR',
) {
  let books = [BOOK];
  const users = [{ ...USER, role: 'READER' }];
  const session = {
    accessToken: 'test-access',
    tokenType: 'Bearer',
    expiresIn: 900,
    user: { ...USER, role: role === 'VISITOR' ? 'READER' : role },
  };
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/api/v1', '');
    const method = request.method();
    if (path === '/auth/refresh')
      return route.fulfill({
        status: role === 'VISITOR' ? 401 : 200,
        json: role === 'VISITOR' ? { detail: 'Sem sessão' } : session,
      });
    if (path === '/auth/login' || path === '/auth/register')
      return route.fulfill({
        status: path.endsWith('register') ? 201 : 200,
        json: session,
      });
    if (path === '/auth/logout') return route.fulfill({ status: 204 });
    if (path === '/dashboard/summary')
      return route.fulfill({
        json: {
          totalTitles: books.length,
          totalCopies: 3,
          availableCopies: 2,
          unavailableCopies: 1,
          totalCategories: 1,
          recentBooks: books,
        },
      });
    if (path === '/books' && method === 'GET') {
      const title = url.searchParams.get('title')?.toLowerCase() ?? '';
      const content = books.filter((book) =>
        book.title.toLowerCase().includes(title),
      );
      return route.fulfill({
        json: {
          content,
          number: Number(url.searchParams.get('page') ?? 0),
          size: 10,
          totalElements: content.length,
          totalPages: 1,
        },
      });
    }
    if (path === '/books' && method === 'POST') {
      const data = request.postDataJSON() as typeof BOOK;
      if (books.some((book) => book.isbn === data.isbn))
        return route.fulfill({
          status: 409,
          json: { detail: 'ISBN já cadastrado.' },
        });
      const created = { ...BOOK, ...data, id: 'b2' };
      books.push(created);
      return route.fulfill({ status: 201, json: created });
    }
    if (path.startsWith('/books/')) {
      const id = path.split('/').at(-1);
      if (method === 'DELETE') {
        books = books.filter((book) => book.id !== id);
        return route.fulfill({ status: 204 });
      }
      if (method === 'PUT') {
        books = books.map((book) =>
          book.id === id
            ? { ...book, ...(request.postDataJSON() as typeof BOOK) }
            : book,
        );
      }
      const book = books.find((item) => item.id === id);
      return route.fulfill({
        status: book ? 200 : 404,
        json: book ?? { detail: 'Livro não encontrado' },
      });
    }
    if (path === '/users')
      return route.fulfill({
        json: {
          content: users,
          number: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        },
      });
    if (path.startsWith('/users/') && method === 'PATCH') {
      const data = request.postDataJSON() as Partial<typeof USER>;
      Object.assign(users[0] ?? {}, data);
      return route.fulfill({ json: users[0] });
    }
    return route.fulfill({
      status: 404,
      json: { detail: 'Endpoint não encontrado no contrato de teste.' },
    });
  });
}

test('CA-UI-001: protects routes, validates login and opens API contract dashboard data', async ({
  page,
}) => {
  await mockLibrary(page, 'VISITOR');
  await page.goto('/books');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByText('Informe um e-mail válido.')).toBeVisible();
  await page.getByLabel('E-mail', { exact: true }).fill('maria@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('test-password-long');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Olá, Maria' })).toBeVisible();
  await expect(page.getByText('Clean Code', { exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem('accessToken')),
  ).toBeNull();
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test('CA-UI-003: creates, views, edits, searches and deletes a book with confirmation', async ({
  page,
}) => {
  await mockLibrary(page, 'LIBRARIAN');
  await page.goto('/books');
  await page.getByRole('button', { name: 'Novo livro' }).click();
  await page.getByLabel('Título', { exact: true }).fill('Design Patterns');
  await page.getByLabel('Autor', { exact: true }).fill('Erich Gamma');
  await page.getByLabel('ISBN', { exact: true }).fill('9780201633610');
  await page.getByRole('button', { name: 'Salvar livro' }).click();
  await expect(
    page.getByText('Design Patterns', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Visualizar Design Patterns' })
    .click();
  await expect(page.getByRole('dialog')).toContainText('9780201633610');
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.getByRole('button', { name: 'Editar Design Patterns' }).click();
  await page
    .getByLabel('Título', { exact: true })
    .fill('Design Patterns revisado');
  await page.getByRole('button', { name: 'Salvar livro' }).click();
  await expect(
    page.getByText('Design Patterns revisado', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Pesquisar por título').fill('revisado');
  await page.getByRole('button', { name: 'Filtrar', exact: true }).click();
  await expect(page.getByText('Clean Code', { exact: true })).not.toBeVisible();
  await page
    .getByRole('button', { name: 'Excluir Design Patterns revisado' })
    .click();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(
    page.getByText('Design Patterns revisado', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Excluir Design Patterns revisado' })
    .click();
  await page.getByRole('button', { name: 'Confirmar exclusão' }).click();
  await expect(page.getByText('Nenhum livro encontrado')).toBeVisible();
});

test('CA-UI-003e: preserves data after ISBN conflict', async ({ page }) => {
  await mockLibrary(page, 'ADMIN');
  await page.goto('/books');
  await page.getByRole('button', { name: 'Novo livro' }).click();
  await page.getByLabel('Título', { exact: true }).fill('Livro duplicado');
  await page.getByLabel('Autor', { exact: true }).fill('Autor');
  await page.getByLabel('ISBN', { exact: true }).fill(BOOK.isbn);
  await page.getByRole('button', { name: 'Salvar livro' }).click();
  await expect(page.getByRole('alert')).toContainText('ISBN já cadastrado.');
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue(
    'Livro duplicado',
  );
});

test('CA-UI-004: readers cannot access administration or mutation actions', async ({
  page,
}) => {
  await mockLibrary(page, 'READER');
  await page.goto('/books');
  await expect(page.getByText('Clean Code', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Novo livro' })).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Editar Clean Code' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Gerenciar usuários' }),
  ).toHaveCount(0);
  await page.goto('/users');
  await expect(
    page.getByRole('heading', { name: 'Acesso restrito' }),
  ).toBeVisible();
});

test('CA-UI-003d: deleting the last book on the final page returns to an existing page', async ({ page }) => {
  await mockLibrary(page, 'ADMIN');
  let removed = false;
  await page.route('**/api/v1/books**', async route => {
    if (route.request().method() === 'DELETE') { removed = true; return route.fulfill({ status: 204 }); }
    const number = Number(new URL(route.request().url()).searchParams.get('page') ?? 0);
    const content = number === 0 ? [BOOK] : removed ? [] : [{ ...BOOK, id: 'last', title: 'Último livro' }];
    return route.fulfill({ json: { content, number, size: 10, totalElements: removed ? 10 : 11, totalPages: removed ? 1 : 2 } });
  });
  await page.goto('/books');
  await page.getByRole('button', { name: 'Próxima página' }).click();
  await page.getByRole('button', { name: 'Excluir Último livro' }).click();
  await page.getByRole('button', { name: 'Confirmar exclusão' }).click();
  await expect(page.getByText('10 títulos · página 1 de 1')).toBeVisible();
  await expect(page.getByText('Clean Code', { exact: true })).toBeVisible();
});

test('CA-UI-006: administrators change user role and active status', async ({
  page,
}) => {
  await mockLibrary(page, 'ADMIN');
  await page.goto('/users');
  await page.getByLabel('Perfil de Maria Silva').selectOption('LIBRARIAN');
  await expect(page.getByLabel('Perfil de Maria Silva')).toHaveValue(
    'LIBRARIAN',
  );
  await page.getByRole('button', { name: 'Desativar Maria Silva' }).click();
  await expect(page.getByText('Inativo', { exact: true })).toBeVisible();
});
