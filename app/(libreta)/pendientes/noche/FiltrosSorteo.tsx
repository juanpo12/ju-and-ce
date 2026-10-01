'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FiltrosNoche } from '@/lib/noche';
import type { Pendiente } from '@/db/queries';

/**
 * Para acotar el sorteo: tipo, género y duración. Selects nativos con cara de
 * chip, como los de la biblioteca: en el celular abren la rueda del sistema.
 */
export function FiltrosSorteo({
  pendientes,
  filtros,
  onCambio,
  deshabilitado = false,
}: {
  pendientes: Pendiente[];
  filtros: FiltrosNoche;
  onCambio: (f: FiltrosNoche) => void;
  deshabilitado?: boolean;
}) {
  const hayDeLosDos =
    pendientes.some((p) => p.tipo === 'serie') && pendientes.some((p) => p.tipo === 'pelicula');
  const generos = [...new Set(pendientes.flatMap((p) => p.generos))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  );

  return (
    <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
      {hayDeLosDos && (
        <Chip
          activo={Boolean(filtros.tipo)}
          value={filtros.tipo ?? ''}
          disabled={deshabilitado}
          onChange={(e) =>
            onCambio({ ...filtros, tipo: (e.target.value || undefined) as FiltrosNoche['tipo'] })
          }
          aria-label="Película o serie"
        >
          <option value="">Pelis y series</option>
          <option value="pelicula">Solo películas</option>
          <option value="serie">Solo series</option>
        </Chip>
      )}

      {generos.length > 1 && (
        <Chip
          activo={Boolean(filtros.genero)}
          value={filtros.genero ?? ''}
          disabled={deshabilitado}
          onChange={(e) => onCambio({ ...filtros, genero: e.target.value || undefined })}
          aria-label="Género"
        >
          <option value="">Cualquier género</option>
          {generos.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Chip>
      )}

      <Chip
        activo={Boolean(filtros.duracionMax)}
        value={filtros.duracionMax ?? ''}
        disabled={deshabilitado}
        onChange={(e) =>
          onCambio({ ...filtros, duracionMax: e.target.value ? Number(e.target.value) : undefined })
        }
        aria-label="Duración máxima"
      >
        <option value="">Cualquier duración</option>
        <option value="90">Hasta 1 h 30</option>
        <option value="120">Hasta 2 h</option>
        <option value="150">Hasta 2 h 30</option>
      </Chip>
    </div>
  );
}

function Chip({
  activo,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { activo: boolean }) {
  return (
    <span className="relative shrink-0">
      <select
        className={cn(
          'foco tocable h-9 cursor-pointer appearance-none rounded-full border py-0 pl-3.5 pr-8 text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60',
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
