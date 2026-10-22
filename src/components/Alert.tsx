interface AlertProps {
  type?: 'error' | 'success';
  message: string | null;
}

export function Alert({ type = 'error', message }: AlertProps) {
  if (!message) return null;
  return (
    <p className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {message}
    </p>
  );
}
