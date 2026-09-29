'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  return (href: string) => (href === '/' ? ruta === '/' : ruta.startsWith(href));
}

export function TabBar() {
  const activa = usarActiva();
  return (
    <nav
      aria-label="Secciones"
      className="safe-abajo fixed inset-x-0 bottom-0 z-20 border-t border-borde bg-superficie/95 backdrop-blur md:hidden"
    >
      <ul className="flex">
        {SECCIONES.map(({ href, texto, icono: Icono }) => {
          const on = activa(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={on ? 'page' : undefined}
                className="foco flex flex-col items-center gap-0.5 py-2 text-[0.68rem]"
                style={{ color: on ? 'var(--acento)' : 'var(--tinta-suave)' }}
              >
                <Icono />
                {texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Sidebar({ espacio, nombre }: { espacio: string; nombre: string }) {
  const activa = usarActiva();
  return (
    <nav
      aria-label="Secciones"
      className="hidden w-56 shrink-0 flex-col gap-1 border-r border-borde px-3 py-6 md:sticky md:top-0 md:flex md:h-dvh"
    >
      <div className="px-3 pb-5">
        <p className="font-titulo text-2xl leading-tight text-tinta">{espacio}</p>
        <p className="text-xs text-tinta-suave">Hola, {nombre}</p>
      </div>
      {SECCIONES.map(({ href, texto, icono: Icono }) => {
        const on = activa(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? 'page' : undefined}
            className="foco flex items-center gap-3 rounded-tema px-3 py-2 text-sm transition-colors"
            style={{
              color: on ? 'var(--acento)' : 'var(--tinta)',
              backgroundColor: on ? 'var(--acento-suave)' : 'transparent',
            }}
          >
            <Icono />
            {texto}
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
