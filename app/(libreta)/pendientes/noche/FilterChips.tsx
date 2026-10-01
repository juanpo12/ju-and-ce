'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DrawFilters } from '@/lib/movie-night';
import type { Pendiente } from '@/db/queries';

/**
 * Narrowing the draw: type, genre and duration. Native selects styled as
 * chips, like the ones in the library: on the phone they open the system wheel.
 */
export function FilterChips({
  pending,
  filters,
  onChange,
  disabled = false,
}: {
  pending: Pendiente[];
  filters: DrawFilters;
  onChange: (f: DrawFilters) => void;
  disabled?: boolean;
}) {
  const hasBoth =
    pending.some((p) => p.tipo === 'serie') && pending.some((p) => p.tipo === 'pelicula');
  const genres = [...new Set(pending.flatMap((p) => p.generos))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  );

  return (
    <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
      {hasBoth && (
        <Chip
          active={Boolean(filters.type)}
          value={filters.type ?? ''}
          disabled={disabled}
          onChange={(e) =>
            onChange({ ...filters, type: (e.target.value || undefined) as DrawFilters['type'] })
          }
          aria-label="Película o serie"
        >
          <option value="">Pelis y series</option>
          <option value="pelicula">Solo películas</option>
          <option value="serie">Solo series</option>
        </Chip>
      )}

      {genres.length > 1 && (
        <Chip
          active={Boolean(filters.genre)}
          value={filters.genre ?? ''}
          disabled={disabled}
          onChange={(e) => onChange({ ...filters, genre: e.target.value || undefined })}
          aria-label="Género"
        >
          <option value="">Cualquier género</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Chip>
      )}

      <Chip
        active={Boolean(filters.maxDuration)}
        value={filters.maxDuration ?? ''}
        disabled={disabled}
        onChange={(e) =>
          onChange({ ...filters, maxDuration: e.target.value ? Number(e.target.value) : undefined })
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
  active,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { active: boolean }) {
  return (
    <span className="relative shrink-0">
      <select
        className={cn(
          'foco tocable h-9 cursor-pointer appearance-none rounded-full border py-0 pl-3.5 pr-8 text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60',
          active
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
