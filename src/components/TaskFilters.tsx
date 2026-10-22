import type { TaskFilter } from '../features/tasks/taskStats';

const OPTIONS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'completed', label: 'Completadas' },
];

interface Props {
  value: TaskFilter;
  onChange: (filter: TaskFilter) => void;
}

export function TaskFilters({ value, onChange }: Props) {
  return (
    <div className="filters" role="group" aria-label="Filtrar tareas">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={`chip ${value === opt.value ? 'chip-active' : ''}`}
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
