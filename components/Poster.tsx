import Image from 'next/image';
import { urlPoster } from '@/lib/tmdb-url';

const TAMANOS = {
  chico: { ancho: 'w185' as const, w: 92, h: 138 },
  grilla: { ancho: 'w342' as const, w: 342, h: 513 },
  ficha: { ancho: 'w500' as const, w: 500, h: 750 },
};

/**
 * El póster, o un marcador cuando TMDB no tiene imagen. El marcador es una
 * claqueta y nada más: el título ya está debajo en la tarjeta y al lado en la
 * ficha, así que repetirlo acá solo agrega ruido.
 */
export function Poster({
  path,
  titulo,
  tamano = 'grilla',
  prioridad = false,
}: {
  path: string | null | undefined;
  titulo: string;
  tamano?: keyof typeof TAMANOS;
  prioridad?: boolean;
}) {
  const { ancho, w, h } = TAMANOS[tamano];
  const url = urlPoster(path, ancho);

  if (!url) {
    return (
      <div
        className="flex aspect-[2/3] w-full items-center justify-center bg-acento-suave"
        style={{ borderRadius: 'inherit' }}
        role="img"
        aria-label={`Sin póster de ${titulo}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-1/4 max-w-16 opacity-40"
          fill="none"
          stroke="var(--tinta-suave)"
          strokeWidth={1.4}
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="2.5" y="6" width="19" height="13" rx="2" />
          <path d="M2.5 10h19M7 6L5 10M12 6l-2 4M17 6l-2 4" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={`Póster de ${titulo}`}
      width={w}
      height={h}
      priority={prioridad}
      sizes={tamano === 'grilla' ? '(min-width: 768px) 220px, 45vw' : undefined}
      className="aspect-[2/3] w-full object-cover"
      style={{ borderRadius: 'inherit' }}
    />
  );
}
