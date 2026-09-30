import { exigirPerfil } from '@/lib/sesion';
import { personasDe } from '@/lib/personas';
import { Cabecera, Sidebar, TabBar } from '@/components/Nav';
import { EscuchaCambios } from '@/components/EscuchaCambios';

export default async function LayoutLibreta({ children }: { children: React.ReactNode }) {
  const perfil = await exigirPerfil();
  const { yo, otro } = personasDe(perfil);

  return (
    <div className="flex min-h-dvh">
      <Sidebar espacio={perfil.espacioNombre} nombre={perfil.nombre} />

      {/* pb-28 deja lugar para la tab bar y su botón central; en desktop no hace falta. */}
      <main className="min-w-0 flex-1 pb-28 md:pb-0">
        <Cabecera espacio={perfil.espacioNombre} />
        <div className="mx-auto w-full max-w-[1100px] px-4 py-5 md:px-8 md:py-8">{children}</div>
      </main>

      <TabBar />
      <EscuchaCambios espacioId={perfil.espacioId} yo={yo} otro={otro} />
    </div>
  );
}
