import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variante = 'primario' | 'secundario' | 'suave' | 'fantasma' | 'peligro';

/**
 * Cuatro caras, todas con fondo: un botón que es solo texto suelto no se
 * reconoce como botón, y menos en el celular, donde no hay hover que lo delate.
 *
 * - primario: la acción de la pantalla, con el acento.
 * - secundario: una tarjeta, para lo que acompaña al primario.
 * - suave: el acento diluido, para «Cancelar», «Editar» y acciones laterales.
 * - fantasma: un velo del color del texto. Sirve sobre cualquier fondo, también
 *   sobre uno de color (con `text-current` toma ese color).
 * - peligro: para lo que borra o saca, teñido de rojo pero sin gritar.
 */
const ESTILOS: Record<Variante, string> = {
  primario: 'bg-acento text-sobre-acento shadow-baja hover:brightness-110',
  secundario: 'tarjeta text-tinta hover:bg-acento-suave',
  suave: 'bg-acento-suave/70 text-tinta hover:bg-acento-suave',
  fantasma: 'bg-current/10 text-tinta hover:bg-current/15',
  peligro:
    'border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15 dark:bg-destructive/15 dark:hover:bg-destructive/25',
};

const COMUN =
  'foco tocable inline-flex min-h-10 items-center justify-center gap-2 rounded-tema px-4 py-2 text-sm font-semibold transition-[filter,background-color,color,transform] disabled:cursor-not-allowed disabled:opacity-50';

export function Boton({
  variante = 'primario',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return <button className={cn(COMUN, ESTILOS[variante], className)} {...props} />;
}

export function BotonLink({
  variante = 'primario',
  className = '',
  ...props
}: React.ComponentProps<typeof Link> & { variante?: Variante }) {
  return <Link className={cn(COMUN, ESTILOS[variante], className)} {...props} />;
}
