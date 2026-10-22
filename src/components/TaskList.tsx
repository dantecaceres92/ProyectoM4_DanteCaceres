import { TaskItem, type TaskItemProps } from './TaskItem';
import type { Task } from '../types';

interface TaskListProps extends Omit<TaskItemProps, 'task'> {
  tasks: Task[];
}

export function TaskList({ tasks, ...handlers }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="empty">No hay tareas para mostrar. ¡Creá la primera! 🚀</p>;
  }
  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} {...handlers} />
      ))}
    </ul>
  );
}
