import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskForm } from '../src/components/TaskForm';

describe('<TaskForm />', () => {
  it('muestra error y NO envía si el título está vacío', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Agregar tarea' }));

    expect(screen.getByText('El título es obligatorio')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envía los datos (sin espacios extra) y limpia el formulario', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Título'), '  Preparar informe  ');
    await userEvent.type(screen.getByLabelText('Descripción'), 'Para el lunes');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar tarea' }));

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Preparar informe', description: 'Para el lunes' });
    expect(screen.getByLabelText('Título')).toHaveValue('');
  });

  it('en modo edición precarga valores y permite cancelar', async () => {
    const onCancel = vi.fn();
    render(
      <TaskForm
        onSubmit={vi.fn()}
        initialValues={{ title: 'Vieja', description: 'desc' }}
        submitLabel="Guardar"
        onCancel={onCancel}
      />,
    );

    expect(screen.getByLabelText('Título')).toHaveValue('Vieja');
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
