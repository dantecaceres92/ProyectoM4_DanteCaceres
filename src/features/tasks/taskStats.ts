import type { Task } from '../../types';

export type TaskFilter = 'all' | 'pending' | 'completed';

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  percentage: number;
}

export function getTaskStats(tasks: Pick<Task, 'completed'>[]): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  return {
    total,
    completed,
    pending: total - completed,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function filterTasks<T extends Pick<Task, 'completed'>>(tasks: T[], filter: TaskFilter): T[] {
  if (filter === 'pending') return tasks.filter((t) => !t.completed);
  if (filter === 'completed') return tasks.filter((t) => t.completed);
  return tasks;
}
