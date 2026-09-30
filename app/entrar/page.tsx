import { FormularioEntrar } from './FormularioEntrar';

export const metadata = { title: 'Entrar — Nuestra libreta' };

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string }>;
}) {
  const { volver } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="tarjeta w-full max-w-sm px-6 py-8">
        <h1 className="font-titulo text-4xl leading-none text-tinta">Nuestra libreta</h1>
        <p className="mt-2 text-sm leading-relaxed text-tinta-suave">
          Entrá con tu mail y tu contraseña. Si todavía no tenés cuenta, pedile el link de invitación a quien armó la libreta.
        </p>

        <FormularioEntrar volver={volver} />
      </div>
    </main>
  );
}
