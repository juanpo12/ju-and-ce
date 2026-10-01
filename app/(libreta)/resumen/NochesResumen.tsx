import { Avatar } from '@/components/Avatar';
import { Poster } from '@/components/Poster';
import { AL_JUEGO, NOMBRE_JUEGO, type Juego } from '@/lib/noche';
import { varColor, type Persona } from '@/lib/personas';
import type { NocheDelHistorial, TallyNoches } from '@/db/queries';

/**
 * Quién gana más seguido cuando no se ponen de acuerdo. Una barra por persona
 * en su color, el conteo por juego, y las últimas noches con su peli.
 */
export function NochesResumen({
  tally,
  ultimas,
  yo,
  otro,
}: {
  tally: TallyNoches;
  ultimas: NocheDelHistorial[];
  yo: Persona;
  otro: Persona | null;
}) {
  const personas = otro ? [yo, otro] : [yo];
  const disputadas = personas.reduce((s, p) => s + (tally.porPersona[p.id] ?? 0), 0);
  const juegos = (Object.entries(tally.porJuego) as [Juego, number][]).sort((a, b) => b[1] - a[1]);

  return (
    <section>
      <h2 className="mb-2 font-titulo text-3xl text-tinta">Noches de peli</h2>
      <div className="tarjeta flex flex-col gap-4 px-4 py-4">
        <p className="text-sm text-tinta-suave">
          {tally.total} {tally.total === 1 ? 'noche elegida' : 'noches elegidas'}
          {tally.coincidieron > 0 && ` · ${tally.coincidieron} coincidiendo`}
          {tally.alAzar > 0 && ` · ${tally.alAzar} con el dado`}
        </p>

        {disputadas > 0 && (
          <ul className="flex flex-col gap-2" aria-label="Partidas ganadas">
            {personas.map((p) => {
              const n = tally.porPersona[p.id] ?? 0;
              return (
                <li key={p.id} className="flex items-center gap-2 text-sm">
                  <Avatar persona={p} />
                  <span className="w-12 truncate text-tinta">{p.id === yo.id ? 'vos' : p.nombre}</span>
                  <span className="relative h-5 flex-1 overflow-hidden rounded-full bg-acento-suave/60">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ width: `${(n / disputadas) * 100}%`, backgroundColor: varColor(p.color) }}
                    />
                  </span>
                  <span className="w-6 text-right font-cartel text-xl tabular-nums" style={{ color: varColor(p.color) }}>
                    {n}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {juegos.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Por juego">
            {juegos.map(([juego, n]) => (
              <li key={juego} className="rounded-full border border-borde px-2.5 py-0.5 text-xs text-tinta">
                {NOMBRE_JUEGO[juego]} <span className="text-tinta-suave">×{n}</span>
              </li>
            ))}
          </ul>
        )}

        {ultimas.length > 0 && (
          <ul className="flex flex-col gap-2 border-t border-borde pt-3" aria-label="Últimas noches">
            {ultimas.map((n) => {
              const ganador = personas.find((p) => p.id === n.ganadorId) ?? null;
              const como =
                n.modo === 'individual'
                  ? 'la eligió el dado'
                  : !ganador
                    ? 'coincidieron'
                    : `ganó ${ganador.id === yo.id ? 'vos' : ganador.nombre}${n.juego ? ` ${AL_JUEGO[n.juego]}` : ''}`;
              return (
                <li key={n.id} className="flex items-center gap-2.5 text-sm">
                  <span className="w-7 shrink-0 overflow-hidden rounded-[4px]">
                    {n.titulo ? (
                      <Poster path={n.posterPath} titulo={n.titulo} anio={n.anio} tamano="chico" />
                    ) : (
                      <span className="block aspect-[2/3] w-full bg-acento-suave" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-tinta">{n.titulo ?? 'Una que ya no está'}</span>
                    <span className="flex items-center gap-1 text-xs text-tinta-suave">
                      {ganador && <Avatar persona={ganador} medida="chico" />}
                      {como}
                    </span>
                  </span>
                  {n.terminadaEn && (
                    <time dateTime={n.terminadaEn.toISOString()} className="shrink-0 text-xs text-tinta-suave">
                      {n.terminadaEn.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    </time>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
