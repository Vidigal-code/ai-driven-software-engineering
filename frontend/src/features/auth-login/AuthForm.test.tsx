import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { LoginForm } from '.';

afterEach(() => vi.unstubAllGlobals());

it('RF-UI-001 validates login before requesting authentication', async () => {
  render(<LoginForm onAuthenticated={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(
    await screen.findByText('Informe um e-mail válido.'),
  ).toBeInTheDocument();
  expect(screen.getByText('Informe sua senha.')).toBeInTheDocument();
});

it('CA-UI-001b presents invalid credentials without authenticating', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'Credenciais inválidas.' }), { status: 401 })));
  const authenticated = vi.fn();
  render(<LoginForm onAuthenticated={authenticated} />);
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'reader@example.test' } });
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'test-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas.');
  expect(authenticated).not.toHaveBeenCalled();
});
