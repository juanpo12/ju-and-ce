import { cn } from '@/lib/utils';
import { varColor, type Persona } from '@/lib/personas';

const MEDIDAS = {
  chico: 'size-4 text-[0.6rem]',
  base: 'size-6 text-xs',
  grande: 'size-9 text-base',
} as const;

/**
 * La inicial en su color. `vacio` es el mismo círculo punteado y sin relleno:
 * «de esta persona falta algo», sin tener que escribirlo.
 */
export function Avatar({
  persona,
  medida = 'base',
  vacio = false,
  className,
}: {
  persona: Persona;
  medida?: keyof typeof MEDIDAS;
  vacio?: boolean;
  className?: string;
}) {
  const color = varColor(persona.color);
  return (
    <span
      aria-hidden
      title={persona.nombre}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold uppercase leading-none',
        vacio ? 'border-[1.5px] border-dashed' : 'text-sobre-persona',
        MEDIDAS[medida],
        className,
      )}
      style={vacio ? { borderColor: color, color } : { backgroundColor: color }}
    >
      {persona.nombre.charAt(0)}
    </span>
  );
}
