import { useCallback, useEffect, useState } from 'react';
import * as taskService from '../services/taskService';
import type { Task, TaskInput, TaskUpdate } from '../types';

/** Toda la lógica del CRUD vive acá: los componentes solo consumen el hook */
export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = taskService.subscribeToTasks(
      userId,
      (data) => {
        setTasks(data);
        setLoading(false);
        setError(null);
      },
      () => {
        setError('No se pudieron cargar las tareas.');
        setLoading(false);
      },
    );
    return () => unsubscribe(); // cancela la suscripción → sin memory leaks
  }, [userId]);

  const run = useCallback(async (action: () => Promise<void>, message: string) => {
    try {
      setError(null);
      await action();
    } catch {
      setError(message);
      throw new Error(message);
    }
  }, []);

  const addTask = useCallback(
    (input: TaskInput) => {
      if (!userId) return Promise.reject(new Error('Sin sesión'));
      return run(() => taskService.createTask(userId, input), 'No se pudo crear la tarea.');
    },
    [userId, run],
  );

  const editTask = useCallback(
    (id: string, changes: TaskUpdate) =>
      run(() => taskService.updateTask(id, changes), 'No se pudo actualizar la tarea.'),
    [run],
  );

  const toggleTask = useCallback(
    (task: Task) =>
      run(
        () => taskService.updateTask(task.id, { completed: !task.completed }),
        'No se pudo actualizar la tarea.',
      ),
    [run],
  );

  const removeTask = useCallback(
    (id: string) => run(() => taskService.deleteTask(id), 'No se pudo eliminar la tarea.'),
    [run],
  );

  return { tasks, loading, error, addTask, editTask, toggleTask, removeTask };
}
