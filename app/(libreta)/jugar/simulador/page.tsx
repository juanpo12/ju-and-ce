import { notFound } from 'next/navigation';
import { exigirPerfil } from '@/lib/sesion';
import { personasDe, type Persona } from '@/lib/personas';
import { esDemo } from '@/lib/demo';
import { isModularGame } from '@/lib/movie-night';
import { Simulator } from './Simulator';

export const metadata = { title: 'Simulador — Nuestra libreta' };

/**
 * A development tool: plays a modular game on one screen, both seats, with the
 * logic running in the browser. Only in development or the demo — real
 * matches always go through the server.
 */
export default async function SimulatorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (!esDemo && process.env.NODE_ENV === 'production') notFound();
  const perfil = await exigirPerfil();
  const { yo: me, otro } = personasDe(perfil);
  const other: Persona = otro ?? { id: 'simulated-other', nombre: 'Otra persona', color: me.color === 'durazno' ? 'menta' : 'durazno' };
  const { juego } = await searchParams;

  return <Simulator me={me} other={other} initialGame={juego && isModularGame(juego) ? juego : null} />;
}
