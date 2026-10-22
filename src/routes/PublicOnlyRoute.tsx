import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/Loader';

/** Login/Register: si ya hay sesión, redirige a las tareas */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader text="Verificando sesión..." />;
  if (user) return <Navigate to="/tasks" replace />;
  return <>{children}</>;
}
