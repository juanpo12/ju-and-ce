'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { ArrowDownUp, ChevronDown, X } from 'lucide-react';
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

  const hayFiltros = Boolean(actuales.genero || actuales.anio || actuales.puntajeMinimo);

  return (
    // En mobile, una sola fila que se desliza con el pulgar, con los bordes
    // desvanecidos para que se note que sigue; en desktop entra toda.
    <div
      className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 py-1 transition-opacity [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-md:[mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1.25rem),transparent)] md:mx-0 md:flex-wrap md:px-0"
      style={{ opacity: pendiente ? 0.55 : 1 }}
      aria-busy={pendiente}
    >
      <Chip
        activo={false}
        icono={<ArrowDownUp className="size-3.5" aria-hidden />}
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
          <option value="">Género</option>
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
          <option value="">Año</option>
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
        <option value="">Puntaje</option>
        <option value="3">★ 3 o más</option>
        <option value="4">★ 4 o más</option>
        <option value="4.5">★ 4,5 o más</option>
      </Chip>

      {hayFiltros && (
        <button
          type="button"
          onClick={() => {
            const nuevos = new URLSearchParams(params);
            for (const clave of ['genero', 'anio', 'min']) nuevos.delete(clave);
            empezar(() => router.push(`/?${nuevos}`, { scroll: false }));
          }}
          className="foco tocable inline-flex h-10 shrink-0 items-center gap-1 rounded-full px-3 text-sm font-medium text-tinta-suave transition-colors hover:bg-acento-suave hover:text-tinta"
        >
          <X className="size-4" aria-hidden />
          Limpiar
        </button>
      )}
    </div>
  );
}

/**
 * Un <select> nativo con cara de chip. Nativo a propósito: en el celular abre la
 * rueda del sistema, que es mejor que cualquier menú que dibujemos. Con un filtro
 * puesto, se pinta con el acento para que se note qué está recortando la lista.
 *
 * El ancho tiene tope: un género largo no puede empujar al resto fuera de la
 * pantalla, se corta con puntos suspensivos.
 */
function Chip({
  activo,
  icono,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { activo: boolean; icono?: React.ReactNode }) {
  return (
    <span className="relative shrink-0">
      {icono && (
        <span
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2',
            activo ? 'text-acento' : 'text-tinta-suave',
          )}
        >
          {icono}
        </span>
      )}
      <select
        className={cn(
          'foco tocable h-10 max-w-44 cursor-pointer appearance-none truncate rounded-full border py-0 pr-8 text-sm outline-none transition-colors',
          icono ? 'pl-8' : 'pl-3.5',
          activo
            ? 'border-acento bg-acento-suave font-semibold text-tinta'
            : 'border-borde bg-superficie text-tinta shadow-baja hover:border-tinta-suave/40',
          className,
        )}
        {...props}
      />
      <ChevronDown
        aria-hidden
        className={cn(
          'pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2',
          activo ? 'text-acento' : 'text-tinta-suave',
        )}
      />
    </span>
  );
}
