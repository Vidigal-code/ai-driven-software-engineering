import { API_BASE_URL } from '../config';
import { z } from 'zod';

let accessToken: string | null = null;
let pendingRefresh: Promise<unknown> | null = null;
let generation = 0;
const refreshListeners = new Set<(session: unknown) => void>();
const tokenSchema = z.object({ accessToken: z.string().min(1) });
const COOKIE_AUTH_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
]);
const problemSchema = z.object({
  detail: z.string().optional(),
  title: z.string().optional(),
  errors: z.record(z.string(), z.string()).optional(),
});

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  generation += 1;
}

export function subscribeSessionRefresh(listener: (session: unknown) => void): () => void {
  refreshListeners.add(listener);
  return () => { refreshListeners.delete(listener); };
}

async function rawRequest(
  path: string,
  options: RequestInit,
): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set('X-Requested-With', 'XMLHttpRequest');
  if (options.body) headers.set('Content-Type', 'application/json');
  if (accessToken && !COOKIE_AUTH_PATHS.has(path))
    headers.set('Authorization', `Bearer ${accessToken}`);
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    signal: options.signal ?? AbortSignal.timeout(15_000),
  });
}

async function readResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const data: unknown = await response.json();
  if (!response.ok) {
    const problem = problemSchema.safeParse(data);
    throw new ApiError(
      problem.success
        ? (problem.data.detail ??
            problem.data.title ??
            'Não foi possível concluir a operação.')
        : 'Resposta inválida do servidor.',
      response.status,
      problem.success ? problem.data.errors : {},
    );
  }
  return data;
}

export function refreshSession(): Promise<unknown> {
  if (pendingRefresh !== null) return pendingRefresh;
  const startedGeneration = generation;
  pendingRefresh = rawRequest('/auth/refresh', { method: 'POST' })
    .then(readResponse)
    .then((data) => {
      if (startedGeneration !== generation)
        throw new ApiError('A sessão foi alterada. Entre novamente.', 401);
      accessToken = tokenSchema.parse(data).accessToken;
      for (const listener of refreshListeners) listener(data);
      return data;
    })
    .catch((error: unknown) => {
      if (startedGeneration === generation) {
        accessToken = null;
        globalThis.dispatchEvent(new Event('session-expired'));
      }
      throw error;
    })
    .finally(() => {
      pendingRefresh = null;
    });
  return pendingRefresh;
}

export async function apiRequest(
  path: string,
  options: RequestInit = {},
): Promise<unknown> {
  const requestToken = accessToken;
  const response = await rawRequest(path, options);
  if (response.status !== 401 || COOKIE_AUTH_PATHS.has(path))
    return readResponse(response);
  if (accessToken === requestToken || accessToken === null)
    await refreshSession();
  return readResponse(await rawRequest(path, options));
}
