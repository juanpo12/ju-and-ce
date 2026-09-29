import { Buscador } from './Buscador';

export const metadata = { title: 'Agregar — Nuestra libreta' };

export default function Agregar() {
  return (
    <>
      <header className="mb-5">
        <h1 className="font-titulo text-4xl leading-none text-tinta md:text-5xl">Agregar</h1>
        <p className="mt-1 text-sm text-tinta-suave">
          Buscá la película y elegí si ya la vieron o queda pendiente.
        </p>
      </header>
      <Buscador />
    </>
  );
}
