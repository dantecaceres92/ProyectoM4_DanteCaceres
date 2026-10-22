export function Loader({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
