import { createContext, useEffect, useState, type ReactNode } from 'react';
import { subscribeToAuthChanges } from '../../services/authService';
import type { AuthUser } from '../../types';

export interface AuthContextValue {
  user: AuthUser | null;
  /** true mientras Firebase todavía no confirmó si hay sesión (evita redirecciones prematuras) */
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe; // limpieza al desmontar
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
