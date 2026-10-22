import { Link } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { login, loginWithGoogle } from '../services/authService';

export function LoginPage() {
  // La redirección a /tasks la hace PublicOnlyRoute cuando cambia la sesión
  return (
    <section className="auth-page">
      <AuthForm mode="login" onSubmit={login} onGoogle={loginWithGoogle} />
      <p className="auth-switch">
        ¿No tenés cuenta? <Link to="/register">Registrate</Link>
      </p>
    </section>
  );
}
