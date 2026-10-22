import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskList } from '../src/components/TaskList';
import type { Task } from '../src/types';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  userId: 'u1',
  title: 'Tarea de prueba',
  description: 'Descripción',
  completed: false,
  createdAt: new Date('2026-10-22T10:00:00'),
  updatedAt: null,
  ...overrides,
});

const handlers = () => ({
  onToggle: vi.fn().mockResolvedValue(undefined),
  onEdit: vi.fn().mockResolvedValue(undefined),
  onDelete: vi.fn().mockResolvedValue(undefined),
});

describe('<TaskList />', () => {
  it('muestra un mensaje cuando no hay tareas', () => {
    render(<TaskList tasks={[]} {...handlers()} />);
    expect(screen.getByText(/No hay tareas/)).toBeInTheDocument();
  });

  it('renderiza las tareas recibidas', () => {
    render(<TaskList tasks={[makeTask(), makeTask({ id: '2', title: 'Otra' })]} {...handlers()} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Otra')).toBeInTheDocument();
  });

  it('marca una tarea como completada al hacer click en el checkbox', async () => {
    const h = handlers();
    const task = makeTask();
    render(<TaskList tasks={[task]} {...h} />);

    await userEvent.click(screen.getByRole('checkbox'));
    expect(h.onToggle).toHaveBeenCalledWith(task);
  });

  it('elimina solo si el usuario confirma', async () => {
    const h = handlers();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    render(<TaskList tasks={[makeTask()]} {...h} />);

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(h.onDelete).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(h.onDelete).toHaveBeenCalledWith('1');
    confirmSpy.mockRestore();
  });

  it('edita una tarea inline', async () => {
    const h = handlers();
    render(<TaskList tasks={[makeTask()]} {...h} />);

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const title = screen.getByLabelText('Título');
    await userEvent.clear(title);
    await userEvent.type(title, 'Editada');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(h.onEdit).toHaveBeenCalledWith('1', { title: 'Editada', description: 'Descripción' });
  });
});
