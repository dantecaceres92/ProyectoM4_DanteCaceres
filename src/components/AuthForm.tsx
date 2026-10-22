import { useState, type FormEvent } from 'react';
import { Alert } from './Alert';
import { hasErrors, validateCredentials, type FieldErrors } from '../utils/validators';
import { getAuthErrorMessage } from '../utils/authErrors';
import type { Credentials } from '../types';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (credentials: Credentials) => Promise<void>;
  onGoogle: () => Promise<void>;
}

type Errors = FieldErrors<Credentials & { confirmPassword: string }>;

export function AuthForm({ mode, onSubmit, onGoogle }: AuthFormProps) {
  const isRegister = mode === 'register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validateCredentials(
      { email, password },
      isRegister ? confirmPassword : undefined,
    );
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await onSubmit({ email, password });
    } catch (error) {
      setServerError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setServerError(null);
    try {
      await onGoogle();
    } catch (error) {
      setServerError(getAuthErrorMessage(error));
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h1>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h1>

      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {errors.email && <span className="field-error">{errors.email}</span>}

      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        type="password"
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errors.password && <span className="field-error">{errors.password}</span>}

      {isRegister && (
        <>
          <label htmlFor="confirmPassword">Repetir contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <span className="field-error">{errors.confirmPassword}</span>
          )}
        </>
      )}

      <Alert message={serverError} />

      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? 'Procesando...' : isRegister ? 'Registrarme' : 'Ingresar'}
      </button>
      <button className="btn btn-outline" type="button" onClick={handleGoogle}>
        Continuar con Google
      </button>
    </form>
  );
}
