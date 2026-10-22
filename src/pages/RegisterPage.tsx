import { Link } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { loginWithGoogle, register } from '../services/authService';

export function RegisterPage() {
  return (
    <section className="auth-page">
      <AuthForm mode="register" onSubmit={register} onGoogle={loginWithGoogle} />
      <p className="auth-switch">
        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
      </p>
    </section>
  );
}
