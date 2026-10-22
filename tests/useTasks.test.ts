import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTasks } from '../src/hooks/useTasks';
import * as taskService from '../src/services/taskService';
import type { Task } from '../src/types';

vi.mock('../src/services/taskService');
const service = vi.mocked(taskService);

const task: Task = {
  id: 't1', userId: 'u1', title: 'A', description: '', completed: false, createdAt: null, updatedAt: null,
};

describe('useTasks', () => {
  it('se suscribe a las tareas del usuario y se desuscribe al desmontar', async () => {
    const unsubscribe = vi.fn();
    service.subscribeToTasks.mockImplementation((_uid, onData) => {
      onData([task]);
      return unsubscribe;
    });

    const { result, unmount } = renderHook(() => useTasks('u1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(service.subscribeToTasks).toHaveBeenCalledWith('u1', expect.any(Function), expect.any(Function));
    expect(result.current.tasks).toEqual([task]);

    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce(); // sin memory leaks
  });

  it('expone un mensaje de error si falla la suscripción', async () => {
    service.subscribeToTasks.mockImplementation((_uid, _onData, onError) => {
      onError(new Error('permission-denied'));
      return vi.fn();
    });
    const { result } = renderHook(() => useTasks('u1'));
    await waitFor(() => expect(result.current.error).toBe('No se pudieron cargar las tareas.'));
  });

  it('toggleTask invierte el estado completed', async () => {
    service.subscribeToTasks.mockReturnValue(vi.fn());
    service.updateTask.mockResolvedValue(undefined);
    const { result } = renderHook(() => useTasks('u1'));

    await act(() => result.current.toggleTask(task));
    expect(service.updateTask).toHaveBeenCalledWith('t1', { completed: true });
  });

  it('muestra error si falla la creación (caso de error)', async () => {
    service.subscribeToTasks.mockReturnValue(vi.fn());
    service.createTask.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useTasks('u1'));

    await act(async () => {
      await expect(result.current.addTask({ title: 'X', description: '' })).rejects.toThrow();
    });
    expect(result.current.error).toBe('No se pudo crear la tarea.');
  });
});
