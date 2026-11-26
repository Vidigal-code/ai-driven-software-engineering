import { renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { SessionContext, useSession } from './session-context';

it('provides the authenticated session through its public hook', () => {
  const value = {
    user: null,
    loading: false,
    authenticate: vi.fn(),
    signOut: vi.fn(),
  };
  const { result } = renderHook(useSession, {
    wrapper: ({ children }) => (
      <SessionContext.Provider value={value}>
        {children}
      </SessionContext.Provider>
    ),
  });
  expect(result.current).toBe(value);
});

it('fails clearly when the session provider is missing', () => {
  expect(() => renderHook(useSession)).toThrow(
    'Sessão deve ser utilizada dentro do provider.',
  );
});
