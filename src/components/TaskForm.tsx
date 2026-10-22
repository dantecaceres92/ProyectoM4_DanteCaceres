import { useState, type FormEvent } from 'react';
import { DESCRIPTION_MAX, TITLE_MAX, hasErrors, validateTask, type FieldErrors } from '../utils/validators';
import type { TaskInput } from '../types';

interface TaskFormProps {
  onSubmit: (input: TaskInput) => Promise<void>;
  initialValues?: TaskInput;
  submitLabel?: string;
  onCancel?: () => void;
}

const EMPTY: TaskInput = { title: '', description: '' };

export function TaskForm({
  onSubmit,
  initialValues = EMPTY,
  submitLabel = 'Agregar tarea',
  onCancel,
}: TaskFormProps) {
  const [values, setValues] = useState<TaskInput>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<TaskInput>>({});
  const [submitting, setSubmitting] = useState(false);
  const isEdit = initialValues !== EMPTY;
  const prefix = isEdit ? 'edit' : 'new';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validateTask(values);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSubmitting(true);
    try {
      await onSubmit({ title: values.title.trim(), description: values.description.trim() });
      if (!isEdit) setValues(EMPTY); // limpia el form al crear
    } catch {
      // el error ya se muestra desde el hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate aria-label="Formulario de tarea">
      <label htmlFor={`${prefix}-title`}>Título</label>
      <input
        id={`${prefix}-title`}
        maxLength={TITLE_MAX}
        value={values.title}
        onChange={(e) => setValues({ ...values, title: e.target.value })}
        placeholder="Ej: Preparar informe semanal"
      />
      {errors.title && <span className="field-error">{errors.title}</span>}

      <label htmlFor={`${prefix}-description`}>Descripción</label>
      <textarea
        id={`${prefix}-description`}
        maxLength={DESCRIPTION_MAX}
        rows={2}
        value={values.description}
        onChange={(e) => setValues({ ...values, description: e.target.value })}
        placeholder="Opcional"
      />
      {errors.description && <span className="field-error">{errors.description}</span>}

      <div className="row">
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Guardando...' : submitLabel}
        </button>
        {onCancel && (
          <button className="btn btn-ghost" type="button" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
