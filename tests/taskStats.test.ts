import { describe, expect, it } from 'vitest';
import { filterTasks, getTaskStats } from '../src/features/tasks/taskStats';

const tasks = [{ completed: true }, { completed: false }, { completed: false }];

describe('getTaskStats', () => {
  it('calcula totales y porcentaje', () => {
    expect(getTaskStats(tasks)).toEqual({ total: 3, completed: 1, pending: 2, percentage: 33 });
  });

  it('no divide por cero con lista vacía', () => {
    expect(getTaskStats([]).percentage).toBe(0);
  });
});

describe('filterTasks', () => {
  it('filtra por estado', () => {
    expect(filterTasks(tasks, 'completed')).toHaveLength(1);
    expect(filterTasks(tasks, 'pending')).toHaveLength(2);
    expect(filterTasks(tasks, 'all')).toHaveLength(3);
  });
});
