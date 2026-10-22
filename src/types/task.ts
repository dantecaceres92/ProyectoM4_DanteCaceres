export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/** Datos que el usuario ingresa en el formulario */
export interface TaskInput {
  title: string;
  description: string;
}

/** Campos editables de una tarea existente */
export type TaskUpdate = Partial<Pick<Task, 'title' | 'description' | 'completed'>>;
