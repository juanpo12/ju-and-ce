'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BotonModo } from './BotonModo';

/**
 * La única zona que pide dos componentes de verdad: una tab bar y una sidebar no
 * comparten estructura. El resto del responsive son prefijos `md:`.
 */

const SECCIONES = [
  { href: '/', texto: 'Biblioteca', icono: Libro },
  { href: '/pendientes', texto: 'Pendientes', icono: Reloj },
  { href: '/agregar', texto: 'Agregar', icono: Mas },
  { href: '/resumen', texto: 'Resumen', icono: Grafico },
  { href: '/jugar', texto: 'Jugar', icono: Joystick },
];

function usarActiva() {
  const ruta = usePathname();
  return (href: string) =>
    href === '/' ? ruta === '/' || ruta.startsWith('/peli/') : ruta.startsWith(href);
}

const suave = { type: 'spring', bounce: 0.18, duration: 0.35 } as const;

/**
 * Abajo, para el pulgar. «Agregar» va en el medio y en grande porque es lo que
 * más se hace desde el celular: salir del cine y anotarla.
 */
export function TabBar() {
  const activa = usarActiva();
  return (
    <nav
      aria-label="Secciones"
      className="safe-abajo fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-superficie/90 shadow-alta backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch px-1">
        {SECCIONES.map(({ href, texto, icono: Icono }) => {
          const on = activa(href);

          if (href === '/agregar') {
            return (
              <li key={href} className="flex flex-1 justify-center">
                <Link
                  href={href}
                  aria-current={on ? 'page' : undefined}
                  aria-label={texto}
                  className="foco tocable -mt-5 flex size-14 items-center justify-center rounded-full bg-acento text-sobre-acento shadow-alta ring-4 ring-fondo"
                >
                  <MasGrande />
                </Link>
              </li>
            );
          }

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={on ? 'page' : undefined}
                className="foco tocable relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-medium transition-colors"
                style={{ color: on ? 'var(--acento)' : 'var(--tinta-suave)' }}
              >
                <span className="relative flex h-7 w-12 items-center justify-center">
                  {on && (
                    <motion.span
                      layoutId="tab-activa"
                      transition={suave}
                      className="absolute inset-0 rounded-full bg-acento-suave"
                    />
                  )}
                  <span className="relative">
                    <Icono />
                  </span>
                </span>
                {texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Ajustes is not visited often: it sits as an icon next to the mode toggle at
 * the top, and leaves its navigation slot to Jugar.
 */
function SettingsButton({ className }: { className?: string }) {
  const on = usarActiva()('/ajustes');
  return (
    <Link
      href="/ajustes"
      aria-label="Ajustes"
      title="Ajustes"
      aria-current={on ? 'page' : undefined}
      className={cn(
        'foco tocable inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-acento-suave hover:text-acento',
        on ? 'bg-acento-suave text-acento' : 'text-tinta-suave',
        className,
      )}
    >
      <Settings className="size-5" strokeWidth={1.8} aria-hidden />
    </Link>
  );
}

/** On mobile, at the top: the notebook name, the mode toggle and Ajustes. */
export function Cabecera({ espacio }: { espacio: string }) {
  return (
    <header className="safe-arriba sticky top-0 z-20 border-b border-borde/60 bg-fondo/85 backdrop-blur-md md:hidden">
      <div className="flex h-12 items-center justify-between pl-4 pr-1.5">
        <p className="truncate pr-1 font-titulo text-xl text-tinta">{espacio}</p>
        <div className="flex shrink-0 items-center">
          <BotonModo />
          <SettingsButton />
        </div>
      </div>
    </header>
  );
}

export function Sidebar({ espacio, nombre }: { espacio: string; nombre: string }) {
  const activa = usarActiva();
  return (
    <nav
      aria-label="Secciones"
      className="hidden w-60 shrink-0 flex-col gap-1 border-r border-borde bg-superficie/40 px-3 py-6 md:sticky md:top-0 md:flex md:h-dvh"
    >
      <div className="flex items-start justify-between gap-2 pb-4 pl-3">
        <div className="min-w-0">
          <p className="pr-1 font-titulo text-3xl leading-tight text-tinta">{espacio}</p>
          <p className="text-xs text-tinta-suave">Hola, {nombre}</p>
        </div>
        <div className="-mt-1 flex shrink-0 items-center">
          <BotonModo />
          <SettingsButton />
        </div>
      </div>

      <Link
        href="/agregar"
        className="foco tocable mb-3 flex items-center justify-center gap-2 rounded-tema bg-acento px-3 py-2.5 text-sm font-semibold text-sobre-acento shadow-baja transition-[filter] hover:brightness-110"
      >
        <Mas />
        Agregar película
      </Link>

      {SECCIONES.filter((s) => s.href !== '/agregar').map(({ href, texto, icono: Icono }) => {
        const on = activa(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? 'page' : undefined}
            className="foco relative flex items-center gap-3 rounded-tema px-3 py-2 text-sm transition-colors hover:text-acento"
            style={{ color: on ? 'var(--acento)' : 'var(--tinta)' }}
          >
            {on && (
              <motion.span
                layoutId="lateral-activa"
                transition={suave}
                className="absolute inset-0 rounded-tema bg-acento-suave"
              />
            )}
            <span className="relative">
              <Icono />
            </span>
            <span className="relative">{texto}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/* Los íconos, en línea: son unos pocos trazos y no justifican una dependencia.
   La sección activa se marca con color y con `aria-current`, no rellenando el
   dibujo: relleno, un trazo de 1.8 se empasta y queda un borrón. */

const base = 'size-5 shrink-0';
const trazo = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Libro() {
  return (
    <svg viewBox="0 0 24 24" className={base} {...trazo}>
      <path d="M4 5a2 2 0 0 1 2-2h11v18H6a2 2 0 0 1-2-2z" />
      <path d="M9 3v18" />
    </svg>
  );
}

function Reloj() {
  return (
    <svg viewBox="0 0 24 24" className={base} {...trazo}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function Mas() {
  return (
    <svg viewBox="0 0 24 24" className={base} {...trazo}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  );
}

function MasGrande() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" {...trazo} strokeWidth={2.4}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function Grafico() {
  return (
    <svg viewBox="0 0 24 24" className={base} {...trazo}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  );
}

function Joystick() {
  return (
    <svg viewBox="0 0 24 24" className={base} {...trazo}>
      <path d="M7 7h10a5 5 0 0 1 4.9 6l-.7 3.4a2.3 2.3 0 0 1-4 1L15.5 15.5h-7L6.8 17.4a2.3 2.3 0 0 1-4-1L2.1 13A5 5 0 0 1 7 7z" />
      <path d="M8 10v3M6.5 11.5h3M15 10.5h.01M17.5 12.5h.01" />
    </svg>
  );
}
