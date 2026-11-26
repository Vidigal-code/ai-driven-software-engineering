import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  SessionContext,
  logout,
  restoreSession,
  sessionSchema,
  type Session,
  type User,
} from '../../entities/user';
import { setAccessToken, subscribeSessionRefresh } from '../../shared/api/client';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const authenticate = useCallback(
    (session: Session) => {
      setAccessToken(session.accessToken);
      queryClient.clear();
      setUser(session.user);
    },
    [queryClient],
  );
  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeSessionRefresh((data) => {
      const session = sessionSchema.parse(data);
      if (active) setUser(session.user);
    });
    restoreSession()
      .then((session) => {
        if (active) setUser(session.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const expired = () => {
      setUser(null);
      queryClient.clear();
    };
    globalThis.addEventListener('session-expired', expired);
    return () => {
      active = false;
      unsubscribe();
      globalThis.removeEventListener('session-expired', expired);
    };
  }, [queryClient]);
  const signOut = useCallback(async () => {
    await logout();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);
  return (
    <SessionContext.Provider value={{ user, loading, authenticate, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}
