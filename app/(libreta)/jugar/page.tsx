import { redirect } from 'next/navigation';
import { exigirPerfil } from '@/lib/sesion';
import { personasDe } from '@/lib/personas';
import { esDemo } from '@/lib/demo';
import { GAMES, type Game } from '@/lib/movie-night';
import { gameAssets, listarPendientes, recentNight } from '@/db/queries';
import { whyUnavailable } from '@/lib/games/index';
import { NightSession } from '../pendientes/noche/NightSession';
import { StartPlaying } from './StartPlaying';

export const metadata = { title: 'Jugar — Nuestra libreta' };

/**
 * The same games as movie night, with nothing at stake: no candidates and no
 * pick, just who wins. It reuses the session (and its one-live-session limit),
 * so a movie night in progress sends you there instead.
 */
export default async function Play() {
  const perfil = await exigirPerfil();
  const { yo: me, otro: other } = personasDe(perfil);

  const available = Boolean(other) && !esDemo;
  const reason = !other
    ? 'Primero invitá a la otra persona desde Ajustes.'
    : esDemo
      ? 'En la demo no hay Realtime: necesita Supabase del otro lado.'
      : null;

  const [session, assets, pending] = await Promise.all([
    available ? recentNight(perfil.id, true) : null,
    available ? gameAssets(perfil.id) : null,
    available ? listarPendientes(perfil.id) : [],
  ]);

  if (session && !session.state.casual) redirect('/pendientes/noche');

  const header = (
    <header className="mb-5">
      <h1 className="font-titulo text-5xl leading-none text-tinta md:text-6xl">Jugar</h1>
      <p className="mt-1 text-sm text-tinta-suave">Sin peli de por medio: solo para ver quién gana.</p>
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

  return (
    <>
      {header}
      <StartPlaying reason={reason} other={other} />
    </>
  );
}
