import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../services/authService';

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="navbar">
      <span className="brand">✅ MateTasks</span>
      {user && (
        <div className="navbar-user">
          <span className="navbar-email">{user.displayName ?? user.email}</span>
          <button className="btn btn-ghost" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'Saliendo...' : 'Cerrar sesión'}
          </button>
        </div>
      )}
    </header>
  );
}
