import type { Credentials, TaskInput } from '../types';

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 500;

export function validateCredentials(
  { email, password }: Credentials,
  confirmPassword?: string,
): FieldErrors<Credentials & { confirmPassword: string }> {
  const errors: FieldErrors<Credentials & { confirmPassword: string }> = {};
  if (!email.trim()) errors.email = 'El email es obligatorio';
  else if (!EMAIL_REGEX.test(email.trim())) errors.email = 'El email no es válido';

  if (!password) errors.password = 'La contraseña es obligatoria';
  else if (password.length < 6) errors.password = 'Mínimo 6 caracteres';

  if (confirmPassword !== undefined && confirmPassword !== password) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }
  return errors;
}

export function validateTask({ title, description }: TaskInput): FieldErrors<TaskInput> {
  const errors: FieldErrors<TaskInput> = {};
  if (!title.trim()) errors.title = 'El título es obligatorio';
  else if (title.trim().length > TITLE_MAX) errors.title = `Máximo ${TITLE_MAX} caracteres`;
  if (description.trim().length > DESCRIPTION_MAX) {
    errors.description = `Máximo ${DESCRIPTION_MAX} caracteres`;
  }
  return errors;
}

export const hasErrors = (errors: object): boolean => Object.keys(errors).length > 0;
