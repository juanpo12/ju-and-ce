import { BotonLink } from '@/components/Boton';

export default function NoEncontrado() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <div className="tarjeta flex max-w-sm flex-col items-center gap-3 px-6 py-10 text-center">
        <p className="font-titulo text-3xl text-tinta">Acá no hay nada</p>
        <p className="text-sm text-tinta-suave">
          Puede que la hayan sacado de la libreta, o que el link esté mal.
        </p>
        <BotonLink href="/">Volver a la biblioteca</BotonLink>
      </div>
    </main>
  );
}
