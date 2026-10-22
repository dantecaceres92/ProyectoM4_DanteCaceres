import { describe, expect, it } from 'vitest';
import { buildSummary, parseTasks } from '../api/send-summary';

describe('serverless send-summary', () => {
  it('parseTasks rechaza bodies inválidos', () => {
    expect(parseTasks(null)).toBeNull();
    expect(parseTasks({})).toBeNull();
    expect(parseTasks({ tasks: [{ title: 1, completed: 'si' }] })).toBeNull();
  });

  it('parseTasks acepta tareas válidas', () => {
    const tasks = [{ title: 'A', completed: true }];
    expect(parseTasks({ tasks })).toEqual(tasks);
  });

  it('buildSummary arma asunto y separa pendientes/completadas', () => {
    const { subject, text } = buildSummary([
      { title: 'Hecha', completed: true },
      { title: 'Falta', completed: false },
    ]);
    expect(subject).toBe('Resumen de tareas: 1/2 completadas');
    expect(text).toContain('PENDIENTES:\n- Falta');
    expect(text).toContain('COMPLETADAS:\n- Hecha');
  });

  it('escapa HTML para evitar inyección en el email', () => {
    const { html } = buildSummary([{ title: '<script>x</script>', completed: false }]);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
