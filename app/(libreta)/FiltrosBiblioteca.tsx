'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Filtros } from '@/db/queries';
import { cn } from '@/lib/utils';

/**
 * Los filtros viven en la URL, no en estado de React: así se pueden compartir,
 * el botón de atrás funciona, y el servidor rehace la query con los datos
 * correctos en vez de filtrar en el navegador.
 */
export function FiltrosBiblioteca({
  opciones,
  actuales,
}: {
  opciones: { generos: string[]; anios: number[] };
  actuales: Filtros;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pendiente, empezar] = useTransition();

  function cambiar(clave: string, valor: string) {
    const nuevos = new URLSearchParams(params);
    if (valor) nuevos.set(clave, valor);
    else nuevos.delete(clave);
    empezar(() => router.push(`/?${nuevos}`, { scroll: false }));
  }

  return (
    // En mobile, una sola fila que se desliza con el pulgar; en desktop entra toda.
    <div
      className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 transition-opacity [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0"
      style={{ opacity: pendiente ? 0.55 : 1 }}
      aria-busy={pendiente}
    >
      <Chip
        activo={false}
        value={actuales.orden ?? 'recientes'}
        onChange={(e) => cambiar('orden', e.target.value === 'recientes' ? '' : e.target.value)}
        aria-label="Ordenar por"
      >
        <option value="recientes">Más recientes</option>
        <option value="mejores">Mejor puntuadas</option>
        <option value="titulo">Por título</option>
      </Chip>

      {opciones.generos.length > 0 && (
        <Chip
          activo={Boolean(actuales.genero)}
          value={actuales.genero ?? ''}
          onChange={(e) => cambiar('genero', e.target.value)}
          aria-label="Filtrar por género"
        >
          <option value="">Todos los géneros</option>
          {opciones.generos.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Chip>
      )}

      {opciones.anios.length > 1 && (
        <Chip
          activo={Boolean(actuales.anio)}
          value={actuales.anio ?? ''}
          onChange={(e) => cambiar('anio', e.target.value)}
          aria-label="Filtrar por año"
        >
          <option value="">Todos los años</option>
          {opciones.anios.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Chip>
      )}

      <Chip
        activo={Boolean(actuales.puntajeMinimo)}
        value={actuales.puntajeMinimo ?? ''}
        onChange={(e) => cambiar('min', e.target.value)}
        aria-label="Puntaje mínimo"
      >
        <option value="">Cualquier puntaje</option>
        <option value="3">3 o más</option>
        <option value="4">4 o más</option>
        <option value="4.5">4,5 o más</option>
      </Chip>
    </div>
  );
}

/**
 * Un <select> nativo con cara de chip. Nativo a propósito: en el celular abre la
 * rueda del sistema, que es mejor que cualquier menú que dibujemos. Con un filtro
 * puesto, se pinta con el acento para que se note qué está recortando la lista.
 */
function Chip({
  activo,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { activo: boolean }) {
  return (
    <span className="relative shrink-0">
      <select
        className={cn(
          'foco tocable h-9 cursor-pointer appearance-none rounded-full border py-0 pl-3.5 pr-8 text-sm outline-none transition-colors',
          activo
            ? 'border-acento bg-acento-suave font-semibold text-tinta'
            : 'border-borde bg-superficie text-tinta hover:border-tinta-suave/40',
          className,
        )}
        {...props}
      />
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-tinta-suave"
      />
    </span>
  );
}
