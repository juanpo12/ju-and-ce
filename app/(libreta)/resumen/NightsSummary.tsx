import { Avatar } from '@/components/Avatar';
import { Poster } from '@/components/Poster';
import { AT_GAME, GAME_NAME, type Game } from '@/lib/movie-night';
import { varColor, type Persona } from '@/lib/personas';
import type { HistoryNight, NightsTally } from '@/db/queries';

/**
 * Who wins more often when they do not agree. One bar per person in their
 * color, the count per game, and the latest nights with their movie.
 */
export function NightsSummary({
  tally,
  latest,
  me,
  other,
}: {
  tally: NightsTally;
  latest: HistoryNight[];
  me: Persona;
  other: Persona | null;
}) {
  const people = other ? [me, other] : [me];
  const contested = people.reduce((s, p) => s + (tally.byPerson[p.id] ?? 0), 0);
  const games = (Object.entries(tally.byGame) as [Game, number][]).sort((a, b) => b[1] - a[1]);

  return (
    <section>
      <h2 className="mb-2 font-titulo text-3xl text-tinta">Noches de peli</h2>
      <div className="tarjeta flex flex-col gap-4 px-4 py-4">
        <p className="text-sm text-tinta-suave">
          {tally.total} {tally.total === 1 ? 'noche elegida' : 'noches elegidas'}
          {tally.agreed > 0 && ` · ${tally.agreed} coincidiendo`}
          {tally.byDice > 0 && ` · ${tally.byDice} con el dado`}
        </p>

        {contested > 0 && (
          <ul className="flex flex-col gap-2" aria-label="Partidas ganadas">
            {people.map((p) => {
              const n = tally.byPerson[p.id] ?? 0;
              return (
                <li key={p.id} className="flex items-center gap-2 text-sm">
                  <Avatar persona={p} />
                  <span className="w-12 truncate text-tinta">{p.id === me.id ? 'vos' : p.nombre}</span>
                  <span className="relative h-5 flex-1 overflow-hidden rounded-full bg-acento-suave/60">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ width: `${(n / contested) * 100}%`, backgroundColor: varColor(p.color) }}
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

        {games.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Por juego">
            {games.map(([game, n]) => (
              <li key={game} className="rounded-full border border-borde px-2.5 py-0.5 text-xs text-tinta">
                {GAME_NAME[game]} <span className="text-tinta-suave">×{n}</span>
              </li>
            ))}
          </ul>
        )}

        {latest.length > 0 && (
          <ul className="flex flex-col gap-2 border-t border-borde pt-3" aria-label="Últimas noches">
            {latest.map((n) => {
              const winner = people.find((p) => p.id === n.winnerId) ?? null;
              const how =
                n.mode === 'individual'
                  ? 'la eligió el dado'
                  : !winner
                    ? 'coincidieron'
                    : `ganó ${winner.id === me.id ? 'vos' : winner.nombre}${n.game ? ` ${AT_GAME[n.game]}` : ''}`;
              return (
                <li key={n.id} className="flex items-center gap-2.5 text-sm">
                  <span className="w-7 shrink-0 overflow-hidden rounded-[4px]">
                    {n.title ? (
                      <Poster path={n.posterPath} titulo={n.title} anio={n.year} tamano="chico" />
                    ) : (
                      <span className="block aspect-[2/3] w-full bg-acento-suave" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-tinta">{n.title ?? 'Una que ya no está'}</span>
                    <span className="flex items-center gap-1 text-xs text-tinta-suave">
                      {winner && <Avatar persona={winner} medida="chico" />}
                      {how}
                    </span>
                  </span>
                  {n.finishedAt && (
                    <time dateTime={n.finishedAt.toISOString()} className="shrink-0 text-xs text-tinta-suave">
                      {n.finishedAt.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
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
