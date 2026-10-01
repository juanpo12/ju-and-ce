import Link from 'next/link';
import { Avatar } from '@/components/Avatar';
import type { NochePublica } from '@/lib/noche';
import type { Persona } from '@/lib/personas';

/**
 * Hay una sesión abierta: si la abrió el otro, te está esperando; si la
 * abriste vos, seguís donde la dejaste.
 */
export function BannerNoche({ sesion, yo, otro }: { sesion: NochePublica; yo: Persona; otro: Persona }) {
  const laAbrioElOtro = sesion.creadaPor === otro.id;
  const texto =
    sesion.fase === 'esperando' && laAbrioElOtro
      ? `${otro.nombre} te está esperando para elegir la de esta noche`
      : sesion.fase === 'esperando'
        ? `Esperando a ${otro.nombre}…`
        : 'Hay una noche de peli en curso';

  return (
    <Link
      href="/pendientes/noche"
      className="foco tocable mb-5 flex items-center gap-3 rounded-tema border border-acento bg-acento-suave px-4 py-3 text-sm text-tinta shadow-baja"
    >
      <span className="relative flex shrink-0">
        <Avatar persona={laAbrioElOtro ? otro : yo} medida="grande" />
        <span
          aria-hidden
          className="absolute -inset-1 animate-ping rounded-full border-2 border-acento opacity-60"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{texto}</span>
        <span className="block text-xs text-tinta-suave">Tocá para entrar</span>
      </span>
    </Link>
  );
}
