import { createContext, useContext } from 'react';
import type { Session, User } from './user';

export interface SessionContextValue {
  user: User | null;
  loading: boolean;
  authenticate: (session: Session) => void;
  signOut: () => Promise<void>;
}
export const SessionContext = createContext<SessionContextValue | null>(null);
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context)
    throw new Error('Sessão deve ser utilizada dentro do provider.');
  return context;
}
