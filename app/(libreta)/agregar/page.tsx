import { Buscador } from './Buscador';

export const metadata = { title: 'Agregar — Nuestra libreta' };

export default function Agregar() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-5">
        <h1 className="font-titulo text-5xl leading-none text-tinta md:text-6xl">Agregar</h1>
        <p className="mt-1 text-sm text-tinta-suave">
          Buscá la película y elegí si ya la vieron o queda pendiente.
        </p>
      </header>
      <Buscador />
    </div>
  );
}
