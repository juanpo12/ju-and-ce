import { cn } from '@/lib/utils';

type Dibujo = 'rollo' | 'entrada' | 'lupa' | 'pochoclos';

/**
 * El estado vacío: una pantalla sin datos tiene que decir qué hacer, no quedar
 * en blanco. Cada uno con su dibujo, en trazo como los íconos de la nav, y con
 * el acento y la tinta del tema: se ve bien en los seis sin un color propio.
 */
export function Vacio({
  titulo,
  texto,
  accion,
  dibujo = 'rollo',
  className,
}: {
  titulo: string;
  texto: string;
  accion?: React.ReactNode;
  dibujo?: Dibujo;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'tarjeta mx-auto flex max-w-md animate-in flex-col items-center gap-3 px-6 py-10 text-center duration-300 fade-in-0 slide-in-from-bottom-2',
        className,
      )}
    >
      <Ilustracion dibujo={dibujo} />
      <p className="font-titulo text-3xl leading-tight text-tinta">{titulo}</p>
      <p className="max-w-xs text-sm leading-relaxed text-tinta-suave">{texto}</p>
      {accion && <div className="mt-1">{accion}</div>}
    </div>
  );
}

const trazo = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Ilustracion({ dibujo }: { dibujo: Dibujo }) {
  return (
    <div className="relative mb-1 flex size-24 items-center justify-center rounded-full bg-acento-suave text-acento">
      <svg viewBox="0 0 64 64" className="size-14" aria-hidden {...trazo}>
        {dibujo === 'rollo' && (
          <>
            {/* Un rollo de película desenrollándose. */}
            <circle cx="26" cy="26" r="16" />
            <circle cx="26" cy="26" r="3" />
            <circle cx="26" cy="15.5" r="3.5" />
            <circle cx="26" cy="36.5" r="3.5" />
            <circle cx="15.5" cy="26" r="3.5" />
            <circle cx="36.5" cy="26" r="3.5" />
            <path d="M26 42h28v12H26" className="text-tinta-suave" stroke="currentColor" />
            <path
              d="M31 45v6M37 45v6M43 45v6M49 45v6"
              strokeWidth="1.5"
              className="text-tinta-suave"
              stroke="currentColor"
            />
          </>
        )}
        {dibujo === 'entrada' && (
          <>
            {/* Una entrada de cine, con el troquel. */}
            <path
              d="M10 20h44v8a4 4 0 0 0 0 8v8H10v-8a4 4 0 0 0 0-8z"
              transform="rotate(-8 32 32)"
            />
            <path d="M40 18v28" strokeDasharray="2 3" transform="rotate(-8 32 32)" />
            <path
              d="M18 29h14M18 35h10"
              className="text-tinta-suave"
              stroke="currentColor"
              transform="rotate(-8 32 32)"
            />
          </>
        )}
        {dibujo === 'lupa' && (
          <>
            <circle cx="27" cy="27" r="14" />
            <path d="M37.5 37.5L50 50" strokeWidth="3" />
            <path d="M21 24c1.5-3 4-4.5 7-4.5" className="text-tinta-suave" stroke="currentColor" />
          </>
        )}
        {dibujo === 'pochoclos' && (
          <>
            <path d="M18 26l4 28h20l4-28z" />
            <path
              d="M26 26l1.5 28M38 26l-1.5 28"
              className="text-tinta-suave"
              stroke="currentColor"
            />
            <path d="M17 26a5 5 0 0 1 3-9 6 6 0 0 1 11-3 6 6 0 0 1 11 2 5 5 0 0 1 5 10" />
          </>
        )}
      </svg>
    </div>
  );
}
