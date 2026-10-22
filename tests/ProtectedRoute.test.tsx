import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from '../src/routes/ProtectedRoute';
import { useAuth } from '../src/hooks/useAuth';

vi.mock('../src/hooks/useAuth');
const mockedUseAuth = vi.mocked(useAuth);

const renderAt = () =>
  render(
    <MemoryRouter initialEntries={['/tasks']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<p>Pantalla de login</p>} />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <p>Tareas privadas</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

describe('<ProtectedRoute />', () => {
  it('muestra loader mientras se verifica la sesión (sin redirigir antes de tiempo)', () => {
    mockedUseAuth.mockReturnValue({ user: null, loading: true });
    renderAt();
    expect(screen.getByRole('status')).toHaveTextContent('Verificando sesión');
    expect(screen.queryByText('Pantalla de login')).not.toBeInTheDocument();
  });

  it('redirige a /login si no hay usuario', () => {
    mockedUseAuth.mockReturnValue({ user: null, loading: false });
    renderAt();
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    expect(screen.queryByText('Tareas privadas')).not.toBeInTheDocument();
  });

  it('muestra el contenido si hay sesión activa', () => {
    mockedUseAuth.mockReturnValue({
      user: { uid: 'u1', email: 'a@b.com', displayName: null },
      loading: false,
    });
    renderAt();
    expect(screen.getByText('Tareas privadas')).toBeInTheDocument();
  });
});
