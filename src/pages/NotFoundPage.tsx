import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="card center">
      <h1>404</h1>
      <p>La página que buscás no existe.</p>
      <Link to="/tasks">Volver a mis tareas</Link>
    </section>
  );
}
