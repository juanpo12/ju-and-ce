import Image from 'next/image';
import { cn } from '@/lib/utils';
import { urlPoster } from '@/lib/tmdb-url';

const TAMANOS = {
  chico: { ancho: 'w185' as const, w: 92, h: 138 },
  grilla: { ancho: 'w342' as const, w: 342, h: 513 },
  ficha: { ancho: 'w500' as const, w: 500, h: 750 },
};

/**
 * El póster, o uno inventado cuando TMDB no tiene imagen (y en la demo, que no
 * tiene ninguna). El inventado es un afiche de verdad y no una caja vacía: un
 * degradado cuyo tono sale del título, así cada peli tiene el suyo y es siempre
 * el mismo, con el título en letra de marquesina.
 */
export function Poster({
  path,
  titulo,
  anio,
  tamano = 'grilla',
  prioridad = false,
  className,
}: {
  path: string | null | undefined;
  titulo: string;
  anio?: number | null;
  tamano?: keyof typeof TAMANOS;
  prioridad?: boolean;
  className?: string;
}) {
  const { ancho, w, h } = TAMANOS[tamano];
  const url = urlPoster(path, ancho);

  if (!url) return <PosterInventado titulo={titulo} anio={anio} className={className} />;

  return (
    <Image
      src={url}
      alt={`Póster de ${titulo}`}
      width={w}
      height={h}
      // `priority` está deprecado desde Next 16: lo que se ve primero va con
      // carga inmediata y prioridad alta en la red.
      loading={prioridad ? 'eager' : undefined}
      fetchPriority={prioridad ? 'high' : undefined}
      sizes={
        tamano === 'grilla'
          ? '(min-width: 1280px) 200px, (min-width: 768px) 25vw, 45vw'
          : tamano === 'ficha'
            ? '(min-width: 768px) 288px, 60vw'
            : '96px'
      }
      className={cn('aspect-[2/3] w-full object-cover', className)}
      style={{ borderRadius: 'inherit' }}
    />
  );
}

/** Un número estable a partir del título: la misma peli, el mismo tono. */
export function tonoDe(titulo: string) {
  let h = 0;
  for (const c of titulo) h = (h * 31 + c.codePointAt(0)!) >>> 0;
  return h % 360;
}

/**
 * Los colores salen de oklch con luminosidad fija: el tono cambia de peli en peli
 * pero el contraste del título no — texto a L 0,96 sobre fondo a L ≤ 0,42 pasa
 * AA siempre. Es la única superficie que no sigue al tema a propósito: un afiche
 * es oscuro en los dos modos, como en la puerta del cine.
 */
function PosterInventado({
  titulo,
  anio,
  className,
}: {
  titulo: string;
  anio?: number | null;
  className?: string;
}) {
  const t = tonoDe(titulo);
  // Dos capas: las unidades `cqw` se resuelven contra el contenedor *ancestro*,
  // así que el que declara `@container` no puede ser el mismo que las usa.
  return (
    <div
      role="img"
      aria-label={`${titulo}, sin póster`}
      className={cn('@container relative aspect-[2/3] w-full overflow-hidden', className)}
      style={{
        borderRadius: 'inherit',
        color: `oklch(0.96 0.02 ${t})`,
        backgroundImage: [
          // Un reflector desde arriba, como luz de marquesina.
          `radial-gradient(120% 70% at 50% -10%, oklch(0.62 0.12 ${t} / 0.55), transparent 60%)`,
          `linear-gradient(165deg, oklch(0.42 0.09 ${t}) 0%, oklch(0.24 0.06 ${(t + 40) % 360}) 100%)`,
        ].join(','),
      }}
    >
      <div className="absolute inset-0 flex flex-col justify-end p-[9cqw]">
        {/* El filete de afiche viejo, inset para que no toque el borde redondeado. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[4.5cqw] rounded-[calc(var(--radio)*0.6)] border opacity-25"
          style={{ borderColor: 'currentColor' }}
        />
        <span
          aria-hidden
          className="relative line-clamp-4 pt-[0.15em] font-cartel text-[calc(17cqw*var(--cartel-escala))] leading-[0.9] [text-transform:var(--cartel-mayusculas)] tracking-wide [text-wrap:balance]"
        >
          {titulo}
        </span>
        {anio && (
          <span
            aria-hidden
            className="relative mt-[3cqw] font-cartel text-[calc(9cqw*var(--cartel-escala))] tracking-[0.2em] opacity-70"
          >
            {anio}
          </span>
        )}
      </div>
    </div>
  );
}
