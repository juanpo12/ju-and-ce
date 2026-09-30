'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
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
  { href: '/ajustes', texto: 'Ajustes', icono: Rueda },
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

/** En mobile, arriba: el nombre de la libreta y el modo, al alcance sin ir a Ajustes. */
export function Cabecera({ espacio }: { espacio: string }) {
  return (
    <header className="safe-arriba sticky top-0 z-20 border-b border-borde/60 bg-fondo/85 backdrop-blur-md md:hidden">
      <div className="flex h-12 items-center justify-between pl-4 pr-1.5">
        <p className="truncate pr-1 font-titulo text-xl text-tinta">{espacio}</p>
        <BotonModo />
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
        <BotonModo className="-mt-1 shrink-0" />
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

/* Los íconos, en línea: son cinco trazos y no justifican una dependencia.
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

function Rueda() {
  return (
    <svg viewBox="0 0 24 24" className={base} {...trazo}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" />
    </svg>
  );
}
