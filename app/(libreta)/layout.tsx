import { exigirPerfil } from '@/lib/sesion';
import { personasDe } from '@/lib/personas';
import { Cabecera, Sidebar, TabBar } from '@/components/Nav';
import { EscuchaCambios } from '@/components/EscuchaCambios';
import { Mimos } from '@/components/Mimos';
import { BotonTeAmo } from '@/components/BotonTeAmo';

export default async function LayoutLibreta({ children }: { children: React.ReactNode }) {
  const perfil = await exigirPerfil();
  const { yo, otro } = personasDe(perfil);
  // Para Ceci, Juan es «juju».
  const esCeci = perfil.nombre.trim().toLowerCase().startsWith('ceci');
  const teAmo = otro ? (
    <BotonTeAmo
      texto={esCeci ? 'Decirle a juju que lo amás' : `Decirle a ${otro.nombre} que la amás`}
    />
  ) : null;

  return (
    <div className="flex min-h-dvh">
      <Sidebar espacio={perfil.espacioNombre} nombre={perfil.nombre} extra={teAmo} />

      {/* pb-28 deja lugar para la tab bar y su botón central; en desktop no hace falta. */}
      <main className="min-w-0 flex-1 pb-28 md:pb-0">
        <Cabecera espacio={perfil.espacioNombre} extra={teAmo} />
        <div className="mx-auto w-full max-w-[1100px] px-4 py-5 md:px-8 md:py-8">{children}</div>
      </main>

      <TabBar />
      <EscuchaCambios espacioId={perfil.espacioId} yo={yo} otro={otro} />
      <Mimos yo={yo} otro={otro} esCeci={esCeci} />
    </div>
  );
}
