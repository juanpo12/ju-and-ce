import { FormularioEntrar } from './FormularioEntrar';

export const metadata = { title: 'Entrar — Nuestra libreta' };

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string; error?: string }>;
}) {
  const { volver, error } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="tarjeta w-full max-w-sm px-6 py-8">
        <h1 className="font-titulo text-4xl leading-none text-tinta">Nuestra libreta</h1>
        <p className="mt-2 text-sm leading-relaxed text-tinta-suave">
          Poné tu mail y te mandamos un link para entrar. No hay contraseña que recordar.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-tema border border-acento/30 bg-acento-suave px-3 py-2 text-sm text-tinta"
          >
            {error === 'link-vencido'
              ? 'Ese link ya venció o se usó. Pedí uno nuevo.'
              : 'Algo salió mal con el link. Probá de nuevo.'}
          </p>
        )}

        <FormularioEntrar volver={volver} />
      </div>
    </main>
  );
}
