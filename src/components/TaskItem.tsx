import { useState } from 'react';
import { TaskForm } from './TaskForm';
import { formatDate } from '../utils/format';
import type { Task, TaskInput } from '../types';

export interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => Promise<void>;
  onEdit: (id: string, changes: TaskInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="task-item card">
        <TaskForm
          initialValues={{ title: task.title, description: task.description }}
          submitLabel="Guardar"
          onCancel={() => setEditing(false)}
          onSubmit={async (changes) => {
            await onEdit(task.id, changes);
            setEditing(false);
          }}
        />
      </li>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar "${task.title}"?`)) onDelete(task.id).catch(() => {});
  };

  return (
    <li className={`task-item card ${task.completed ? 'is-done' : ''}`}>
      <label className="task-check">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task).catch(() => {})}
          aria-label={`Marcar "${task.title}" como ${task.completed ? 'pendiente' : 'completada'}`}
        />
        <div>
          <h3 className="task-title">{task.title}</h3>
          {task.description && <p className="task-desc">{task.description}</p>}
          <small className="task-date">{formatDate(task.createdAt)}</small>
        </div>
      </label>
      <div className="row task-actions">
        <button className="btn btn-ghost" onClick={() => setEditing(true)}>
          Editar
        </button>
        <button className="btn btn-danger" onClick={handleDelete}>
          Eliminar
        </button>
      </div>
    </li>
  );
}
