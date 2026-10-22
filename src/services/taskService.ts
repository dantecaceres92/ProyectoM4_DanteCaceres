import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Task, TaskInput, TaskUpdate } from '../types';

const tasksCollection = () => collection(db, 'tasks');

const toDate = (value: unknown): Date | null =>
  value && typeof (value as Timestamp).toDate === 'function' ? (value as Timestamp).toDate() : null;

/**
 * Suscripción en tiempo real a las tareas de un usuario (onSnapshot).
 * Devuelve la función unsubscribe: hay que llamarla al desmontar para evitar memory leaks.
 */
export function subscribeToTasks(
  userId: string,
  onData: (tasks: Task[]) => void,
  onError: (error: Error) => void,
): () => void {
  const q = query(tasksCollection(), where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((d) => {
        const data = d.data({ serverTimestamps: 'estimate' });
        return {
          id: d.id,
          userId: data.userId,
          title: data.title,
          description: data.description ?? '',
          completed: Boolean(data.completed),
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
        };
      });
      // Orden en cliente: evita tener que crear un índice compuesto en Firestore
      tasks.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
      onData(tasks);
    },
    onError,
  );
}

export async function createTask(userId: string, input: TaskInput): Promise<void> {
  await addDoc(tasksCollection(), {
    userId,
    title: input.title.trim(),
    description: input.description.trim(),
    completed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateTask(taskId: string, changes: TaskUpdate): Promise<void> {
  await updateDoc(doc(db, 'tasks', taskId), { ...changes, updatedAt: serverTimestamp() });
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, 'tasks', taskId));
}
