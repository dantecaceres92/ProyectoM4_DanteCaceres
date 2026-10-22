import { useState } from 'react';
import { Alert } from './Alert';
import { sendTasksSummary } from '../api/emailApi';
import type { Task } from '../types';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function SendSummaryButton({ tasks }: { tasks: Task[] }) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    setStatus('loading');
    setMessage(null);
    try {
      const res = await sendTasksSummary(tasks);
      setStatus('success');
      setMessage(`Resumen enviado a ${res.sentTo} 📬`);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Error al enviar el email');
    }
  };

  return (
    <div className="summary">
      <button className="btn btn-outline" onClick={handleClick} disabled={status === 'loading'}>
        {status === 'loading' ? 'Enviando...' : '📧 Enviarme resumen por email'}
      </button>
      <Alert type={status === 'success' ? 'success' : 'error'} message={message} />
    </div>
  );
}
