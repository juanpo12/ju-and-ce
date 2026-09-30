import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variante = 'primario' | 'secundario' | 'fantasma';

const ESTILOS: Record<Variante, string> = {
  primario: 'bg-acento text-sobre-acento shadow-baja hover:brightness-110',
  secundario: 'tarjeta text-tinta hover:bg-acento-suave',
  fantasma: 'text-tinta-suave hover:text-acento',
};

const COMUN =
  'foco tocable inline-flex items-center justify-center gap-2 rounded-tema px-4 py-2 text-sm font-semibold transition-[filter,background-color,color,transform] disabled:cursor-not-allowed disabled:opacity-50';

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
