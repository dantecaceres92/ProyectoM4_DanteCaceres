import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { filterTasks, getTaskStats, type TaskFilter } from '../features/tasks/taskStats';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { TaskFilters } from '../components/TaskFilters';
import { SendSummaryButton } from '../components/SendSummaryButton';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';

export function TasksPage() {
  const { user } = useAuth();
  const { tasks, loading, error, addTask, editTask, toggleTask, removeTask } = useTasks(user?.uid);
  const [filter, setFilter] = useState<TaskFilter>('all');

  const stats = useMemo(() => getTaskStats(tasks), [tasks]);
  const visibleTasks = useMemo(() => filterTasks(tasks, filter), [tasks, filter]);

  return (
    <section className="tasks-page">
      <div className="card">
        <h2>Nueva tarea</h2>
        <TaskForm onSubmit={addTask} />
      </div>

      <div className="stats">
        <span>Total: <strong>{stats.total}</strong></span>
        <span>Pendientes: <strong>{stats.pending}</strong></span>
        <span>Completadas: <strong>{stats.completed}</strong> ({stats.percentage}%)</span>
      </div>

      <div className="toolbar">
        <TaskFilters value={filter} onChange={setFilter} />
        <SendSummaryButton tasks={tasks} />
      </div>

      <Alert message={error} />
      {loading ? (
        <Loader text="Cargando tareas..." />
      ) : (
        <TaskList
          tasks={visibleTasks}
          onToggle={toggleTask}
          onEdit={editTask}
          onDelete={removeTask}
        />
      )}
    </section>
  );
}
