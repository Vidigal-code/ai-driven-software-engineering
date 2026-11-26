import { afterEach, expect, it, vi } from 'vitest';
import { apiRequest, refreshSession, setAccessToken } from './client';

afterEach(() => {
  setAccessToken(null);
  vi.unstubAllGlobals();
});

it('RF-UI-002 sends requests to the API and parses the response', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ title: 'Clean Code' }), {
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
  );
  expect(await apiRequest('/books/1')).toEqual({ title: 'Clean Code' });
});

it('RF-UI-004b returns a forbidden Problem Detail without refreshing or escalating', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue(
      new Response(
        JSON.stringify({
          detail: 'Permissão insuficiente',
          errors: { title: 'Obrigatório' },
        }),
        { status: 403 },
      ),
    );
  vi.stubGlobal('fetch', fetch);
  await expect(
    apiRequest('/books', { method: 'POST', body: '{}' }),
  ).rejects.toMatchObject({
    message: 'Permissão insuficiente',
    status: 403,
    errors: { title: 'Obrigatório' },
  });
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(
    new Headers(fetch.mock.calls[0]?.[1].headers).get('X-Requested-With'),
  ).toBe('XMLHttpRequest');
});

it('RF-UI-001d rejects an expired refresh without looping and notifies session expiry', async () => {
  const expired = vi.fn();
  globalThis.addEventListener('session-expired', expired);
  const fetch = vi
    .fn()
    .mockImplementation(
      async () =>
        new Response(JSON.stringify({ title: 'Sessão expirada' }), {
          status: 401,
        }),
    );
  vi.stubGlobal('fetch', fetch);
  await expect(apiRequest('/books')).rejects.toMatchObject({
    status: 401,
    message: 'Sessão expirada',
  });
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(expired).toHaveBeenCalledTimes(1);
  globalThis.removeEventListener('session-expired', expired);
});

it('RF-UI-001 does not restore an in-flight refresh after local logout', async () => {
  let resolveResponse: ((response: Response) => void) | undefined;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        }),
    ),
  );
  const pending = refreshSession();
  setAccessToken(null);
  resolveResponse?.(
    new Response(JSON.stringify({ accessToken: 'stale-token' })),
  );
  await expect(pending).rejects.toMatchObject({ status: 401 });
});

it('RF-UI-003 handles successful deletion without trying to read an empty body', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
  );
  await expect(
    apiRequest('/books/1', { method: 'DELETE' }),
  ).resolves.toBeUndefined();
});

it.each([
  { body: {}, message: 'Não foi possível concluir a operação.' },
  { body: null, message: 'Resposta inválida do servidor.' },
])('normalizes error bodies %j', async ({ body, message }) => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(body), { status: 400 })),
  );
  await expect(
    apiRequest('/auth/login', { method: 'POST' }),
  ).rejects.toMatchObject({ message, status: 400 });
});

it.each(['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'])(
  'omits expired Bearer credentials on the public cookie endpoint %s',
  async (path) => {
    setAccessToken('expired-token');
    const fetch = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetch);
    await apiRequest(path, { method: 'POST' });
    expect(
      new Headers(fetch.mock.calls[0]?.[1].headers).has('Authorization'),
    ).toBe(false);
  },
);

it('keeps Bearer authentication on the protected auth/me endpoint', async () => {
  setAccessToken('valid-token');
  const fetch = vi.fn().mockResolvedValue(new Response('{}'));
  vi.stubGlobal('fetch', fetch);
  await apiRequest('/auth/me');
  expect(
    new Headers(fetch.mock.calls[0]?.[1].headers).get('Authorization'),
  ).toBe('Bearer valid-token');
});

it('renews an expired token for the protected auth/me endpoint', async () => {
  setAccessToken('expired-token');
  const fetch = vi.fn()
    .mockResolvedValueOnce(new Response('{}', { status: 401 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ accessToken: 'renewed-token' })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'reader-1' })));
  vi.stubGlobal('fetch', fetch);
  await expect(apiRequest('/auth/me')).resolves.toEqual({ id: 'reader-1' });
  expect(new Headers(fetch.mock.calls[2]?.[1].headers).get('Authorization')).toBe('Bearer renewed-token');
});

it('reuses an already renewed token when another expired response arrives late', async () => {
  setAccessToken('expired-token');
  let refreshCount = 0;
  let resolveLate: ((response: Response) => void) | undefined;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(async (url: string, options: RequestInit) => {
      if (url.endsWith('/auth/refresh')) {
        refreshCount += 1;
        return new Response(JSON.stringify({ accessToken: 'renewed-token' }));
      }
      if (
        new Headers(options.headers).get('Authorization') ===
        'Bearer renewed-token'
      )
        return new Response('{"ok":true}');
      if (url.endsWith('/slow'))
        return new Promise<Response>((resolve) => {
          resolveLate = resolve;
        });
      return new Response('{}', { status: 401 });
    }),
  );
  const slow = apiRequest('/slow');
  await expect(apiRequest('/fast')).resolves.toEqual({ ok: true });
  resolveLate?.(new Response('{}', { status: 401 }));
  await expect(slow).resolves.toEqual({ ok: true });
  expect(refreshCount).toBe(1);
});

it('RF-UI-001 refreshes once for concurrent unauthorized requests and retries with the new token', async () => {
  let refreshCount = 0;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(async (url: string, options: RequestInit) => {
      if (url.endsWith('/auth/refresh')) {
        refreshCount += 1;
        return new Response(JSON.stringify({ accessToken: 'fresh-token' }));
      }
      if (
        new Headers(options.headers).get('Authorization') ===
        'Bearer fresh-token'
      )
        return new Response(JSON.stringify({ ok: true }));
      return new Response(JSON.stringify({ detail: 'Expirado' }), {
        status: 401,
      });
    }),
  );
  const results = await Promise.all([
    apiRequest('/books'),
    apiRequest('/dashboard/summary'),
  ]);
  expect(results).toEqual([{ ok: true }, { ok: true }]);
  expect(refreshCount).toBe(1);
});
