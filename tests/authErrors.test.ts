import { describe, expect, it } from 'vitest';
import { getAuthErrorMessage } from '../src/utils/authErrors';

describe('getAuthErrorMessage', () => {
  it('traduce códigos conocidos de Firebase', () => {
    expect(getAuthErrorMessage({ code: 'auth/email-already-in-use' })).toBe(
      'Ya existe una cuenta con ese email.',
    );
    expect(getAuthErrorMessage({ code: 'auth/invalid-credential' })).toBe(
      'Email o contraseña incorrectos.',
    );
  });

  it('devuelve un mensaje genérico para errores desconocidos (caso borde)', () => {
    expect(getAuthErrorMessage({ code: 'auth/algo-raro' })).toMatch(/error inesperado/);
    expect(getAuthErrorMessage(null)).toMatch(/error inesperado/);
    expect(getAuthErrorMessage('string')).toMatch(/error inesperado/);
  });
});
