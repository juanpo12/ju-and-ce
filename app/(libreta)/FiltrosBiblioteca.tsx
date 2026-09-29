'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import type { Filtros } from '@/db/queries';

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

  const select =
    'foco rounded-tema border border-borde bg-superficie px-2.5 py-1.5 text-sm text-tinta outline-none';

  return (
    <div
      className="flex flex-wrap items-center gap-2 transition-opacity"
      style={{ opacity: pendiente ? 0.55 : 1 }}
    >
      <select
        className={select}
        value={actuales.orden ?? 'recientes'}
        onChange={(e) => cambiar('orden', e.target.value === 'recientes' ? '' : e.target.value)}
        aria-label="Ordenar por"
      >
        <option value="recientes">Más recientes</option>
        <option value="mejores">Mejor puntuadas</option>
        <option value="titulo">Por título</option>
      </select>

      {opciones.generos.length > 0 && (
        <select
          className={select}
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
        </select>
      )}

      {opciones.anios.length > 1 && (
        <select
          className={select}
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
        </select>
      )}

      <select
        className={select}
        value={actuales.puntajeMinimo ?? ''}
        onChange={(e) => cambiar('min', e.target.value)}
        aria-label="Puntaje mínimo"
      >
        <option value="">Cualquier puntaje</option>
        <option value="3">3 o más</option>
        <option value="4">4 o más</option>
        <option value="4.5">4,5 o más</option>
      </select>
    </div>
  );
}
