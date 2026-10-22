import { getIdToken } from '../services/authService';
import type { Task } from '../types';

export interface SendSummaryResponse {
  message: string;
  sentTo: string;
}

/**
 * Llama a la Vercel Function /api/send-summary.
 * El frontend NUNCA habla con AWS: solo envía el token de Firebase y las tareas.
 */
export async function sendTasksSummary(tasks: Task[]): Promise<SendSummaryResponse> {
  const token = await getIdToken();

  const response = await fetch('/api/send-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      tasks: tasks.map(({ title, description, completed }) => ({ title, description, completed })),
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? 'No se pudo enviar el email. Intentá más tarde.');
  }
  return data as SendSummaryResponse;
}
