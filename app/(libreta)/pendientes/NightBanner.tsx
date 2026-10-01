import Link from 'next/link';
import { Avatar } from '@/components/Avatar';
import type { PublicNight } from '@/lib/movie-night';
import type { Persona } from '@/lib/personas';

/**
 * There is an open session: if the other person opened it, they are waiting
 * for you; if you opened it, you pick up where you left off.
 */
export function NightBanner({ session, me, other }: { session: PublicNight; me: Persona; other: Persona }) {
  const openedByOther = session.createdBy === other.id;
  const text =
    session.phase === 'esperando' && openedByOther
      ? `${other.nombre} te está esperando para elegir la de esta noche`
      : session.phase === 'esperando'
        ? `Esperando a ${other.nombre}…`
        : 'Hay una noche de peli en curso';

  return (
    <Link
      href="/pendientes/noche"
      className="foco tocable mb-5 flex items-center gap-3 rounded-tema border border-acento bg-acento-suave px-4 py-3 text-sm text-tinta shadow-baja"
    >
      <span className="relative flex shrink-0">
        <Avatar persona={openedByOther ? other : me} medida="grande" />
        <span
          aria-hidden
          className="absolute -inset-1 animate-ping rounded-full border-2 border-acento opacity-60"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{text}</span>
        <span className="block text-xs text-tinta-suave">Tocá para entrar</span>
      </span>
    </Link>
  );
}
