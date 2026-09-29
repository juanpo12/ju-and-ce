/**
 * El rating de media en media estrella.
 *
 * El relleno parcial se hace con dos capas y `overflow: hidden`, no con un
 * `linearGradient`: un gradiente necesita un id único por instancia, y eso
 * obligaría a `useId()` — o sea a convertir en cliente un componente que aparece
 * cinco veces por tarjeta. Así lo renderiza el servidor y no baja un byte de JS.
 */

const PUNTAS =
  'M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95L12 2.6z';

const MEDIDAS = {
  chico: 'size-3.5',
  base: 'size-5',
  grande: 'size-7',
  enorme: 'size-9',
} as const;

export type Medida = keyof typeof MEDIDAS;

export function Estrella({
  relleno,
  medida = 'base',
  className = '',
}: {
  relleno: number;
  medida?: Medida;
  className?: string;
}) {
  const tamano = MEDIDAS[medida];
  const recorte = Math.min(1, Math.max(0, relleno)) * 100;

  return (
    <span className={`relative inline-block shrink-0 ${tamano} ${className}`} aria-hidden>
      <svg viewBox="0 0 24 24" className={`${tamano} absolute inset-0`} fill="var(--estrella-vacia)">
        <path d={PUNTAS} />
      </svg>
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${recorte}%` }}
      >
        <svg viewBox="0 0 24 24" className={`${tamano} absolute inset-y-0 left-0`} fill="var(--acento)">
          <path d={PUNTAS} />
        </svg>
      </span>
    </span>
  );
}

export function Estrellas({
  valor,
  medida = 'base',
  className = '',
}: {
  valor: number | null | undefined;
  medida?: Medida;
  className?: string;
}) {
  const v = valor ?? 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={valor ? `${formatear(valor)} de 5 estrellas` : 'Sin puntuar'}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <Estrella key={i} relleno={v - i} medida={medida} />
      ))}
    </span>
  );
}

/** 4.5 → «4,5»; 4 → «4». Coma decimal, que es como se escribe acá. */
export function formatear(n: number) {
  return n.toLocaleString('es-AR', { maximumFractionDigits: 1 });
}
