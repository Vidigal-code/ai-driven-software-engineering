import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import { EvidencePanel } from './index';

afterEach(() => vi.unstubAllGlobals());

it('RF-WF-007 shows the actual API health independently from simulated gates and unavailable CI', async () => {
  vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) =>
    url.endsWith('/actuator/health')
      ? new Response(JSON.stringify({ status: 'UP' }))
      : new Response('', { status: 404 }),
  ));
  render(<QueryClientProvider client={new QueryClient()}><EvidencePanel /></QueryClientProvider>);
  await userEvent.click(screen.getByText('Evidências reais do projeto'));
  expect(await screen.findByText('API: UP')).toBeVisible();
  expect(screen.getByText('CI: execução ainda não registrada')).toBeVisible();
  expect(screen.getByText(/Consulta real à API; não verifica todos os containers/)).toBeVisible();
});

it.each([
  { status: 503, body: { status: 'DOWN' } },
  { status: 200, body: { status: 'DOWN' } },
  { status: 200, body: {} },
])('reports unavailable API health for %j without claiming CI success', async ({ status, body }) => {
  vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) =>
    url.endsWith('/actuator/health')
      ? new Response(JSON.stringify(body), { status })
      : new Response('', { status: 404 }),
  ));
  render(<QueryClientProvider client={new QueryClient()}><EvidencePanel /></QueryClientProvider>);
  await userEvent.click(screen.getByText('Evidências reais do projeto'));
  expect(await screen.findByText('API: Indisponível')).toBeVisible();
  expect(screen.getByText('CI: execução ainda não registrada')).toBeVisible();
});
