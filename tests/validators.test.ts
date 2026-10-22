import { describe, expect, it } from 'vitest';
import { hasErrors, validateCredentials, validateTask } from '../src/utils/validators';

describe('validateCredentials', () => {
  it('no devuelve errores con datos válidos', () => {
    const errors = validateCredentials({ email: 'dante@mail.com', password: '123456' });
    expect(hasErrors(errors)).toBe(false);
  });

  it('detecta email inválido y contraseña corta', () => {
    const errors = validateCredentials({ email: 'no-es-email', password: '123' });
    expect(errors.email).toBe('El email no es válido');
    expect(errors.password).toBe('Mínimo 6 caracteres');
  });

  it('detecta campos vacíos', () => {
    const errors = validateCredentials({ email: '  ', password: '' });
    expect(errors.email).toBe('El email es obligatorio');
    expect(errors.password).toBe('La contraseña es obligatoria');
  });

  it('valida que las contraseñas coincidan en el registro', () => {
    const errors = validateCredentials({ email: 'a@b.com', password: '123456' }, '654321');
    expect(errors.confirmPassword).toBe('Las contraseñas no coinciden');
  });
});

describe('validateTask', () => {
  it('exige título (no acepta solo espacios)', () => {
    expect(validateTask({ title: '   ', description: '' }).title).toBe('El título es obligatorio');
  });

  it('rechaza títulos de más de 100 caracteres', () => {
    expect(validateTask({ title: 'a'.repeat(101), description: '' }).title).toMatch(/Máximo/);
  });

  it('acepta una tarea válida sin descripción', () => {
    expect(hasErrors(validateTask({ title: 'Comprar yerba', description: '' }))).toBe(false);
  });
});
