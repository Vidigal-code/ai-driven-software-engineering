import { act, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import { SessionProvider } from './SessionProvider';
import { useSession } from '../../entities/user';
import { apiRequest, setAccessToken } from '../../shared/api/client';

const user = {
  id: 'user-1', name: 'Leitora', email: 'reader@example.test', role: 'ADMIN',
  active: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
};
function SessionStatus() {
  const session = useSession();
  return <output>{session.loading ? 'Carregando' : session.user?.role ?? 'Sem sessão'}</output>;
}
afterEach(() => { setAccessToken(null); vi.unstubAllGlobals(); });

it('RF-UI-001 updates the visible role when automatic refresh returns the changed user', async () => {
  let refreshCount = 0;
  vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string, options: RequestInit) => {
    if (url.endsWith('/auth/refresh')) {
      refreshCount += 1;
      return new Response(JSON.stringify({ accessToken: `token-${refreshCount}`, tokenType: 'Bearer', expiresIn: 900,
        user: { ...user, role: refreshCount === 1 ? 'ADMIN' : 'READER' },
      }));
    }
    return new Headers(options.headers).get('Authorization') === 'Bearer token-2'
      ? new Response('{}') : new Response('{}', { status: 401 });
  }));
  render(<QueryClientProvider client={new QueryClient()}><SessionProvider><SessionStatus /></SessionProvider></QueryClientProvider>);
  expect(await screen.findByText('ADMIN')).toBeInTheDocument();
  await act(async () => { await apiRequest('/books'); });
  expect(screen.getByText('READER')).toBeInTheDocument();
  expect(refreshCount).toBe(2);
});
