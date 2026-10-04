import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { exigirPerfil } from '@/lib/sesion';
import { personasDe } from '@/lib/personas';
import { esDemo } from '@/lib/demo';
import { GAMES, type Game } from '@/lib/movie-night';
import { gameAssets, listarPendientes, recentNight } from '@/db/queries';
import { whyUnavailable } from '@/lib/games/index';
import { Vacio } from '@/components/Vacio';
import { BotonLink } from '@/components/Boton';
import { ChooseMode } from './ChooseMode';
import { SoloPick } from './SoloPick';
import { NightSession } from './NightSession';

export const metadata = { title: 'Noche de peli — Nuestra libreta' };

/**
 * Choosing what to watch. Three screens depending on the case: with a live
 * session you go straight in; otherwise you choose the mode, and solo mode is
 * the random draw.
 */
export default async function Night({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const perfil = await exigirPerfil();
  const { yo: me, otro: other } = personasDe(perfil);
  const { modo } = await searchParams;

  // Duo mode needs the other person and Supabase behind it (Realtime).
  const duoAvailable = Boolean(other) && !esDemo;
  const reason = !other
    ? 'Primero invitá a la otra persona desde Ajustes.'
    : esDemo
      ? 'En la demo no hay Realtime: necesita Supabase del otro lado.'
      : null;

  const [pending, session, assets] = await Promise.all([
    listarPendientes(perfil.id),
    duoAvailable ? recentNight(perfil.id) : null,
    duoAvailable ? gameAssets(perfil.id) : null,
  ]);

  // A just-for-fun session has its own screen.
  if (session?.state.casual) redirect('/jugar');

  const header = (
    <header className="mb-5">
      <Link
        href="/pendientes"
        className="foco -ml-1 inline-flex items-center gap-1 rounded-sm text-sm text-tinta-suave hover:text-acento"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Pendientes
      </Link>
      <h1 className="mt-1 font-titulo text-5xl leading-none text-tinta md:text-6xl">Noche de peli</h1>
    </header>
  );

  if (session && other && assets) {
    const availability = Object.fromEntries(
      GAMES.map((g) => [g, whyUnavailable(g, assets)]),
    ) as Record<Game, string | null>;
    return (
      <>
        {header}
        <NightSession
          initial={session}
          me={me}
          other={other}
          spaceId={perfil.espacioId}
          pending={pending}
          availability={availability}
        />
      </>
    );
  }

  if (pending.length === 0) {
    return (
      <>
        {header}
        <Vacio
          dibujo="entrada"
          titulo="No hay de dónde elegir"
          texto="Sumá alguna pendiente y volvé: el dado necesita opciones."
          accion={<BotonLink href="/agregar">Sumar una</BotonLink>}
        />
      </>
    );
  }

  if (modo === 'solo') {
    return (
      <>
        {header}
        <SoloPick pending={pending} />
      </>
    );
  }

  return (
    <>
      {header}
      <ChooseMode duoAvailable={duoAvailable} reason={reason} other={other} />
    </>
  );
}
