'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { playAction } from '@/app/acciones';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import type { SecretNumberMatch } from '@/lib/movie-night';
import { varColor } from '@/lib/personas';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import type { Table } from '../types';

/**
 * Pick a number in secret; when both are in, the server draws one and the
 * closer pick wins. The reveal lives here for a beat before the Outcome
 * screen takes over.
 */
export function SecretNumber({
  table,
  match,
  pending,
}: {
  table: Table;
  match: SecretNumberMatch;
  pending: Pendiente[];
}) {
  const { night, me, other, send, busy } = table;
  const [value, setValue] = useState('');
  const [sent, setSent] = useState<number | null>(null);
  const picked = match.picked.includes(me.id);
  const otherPicked = match.picked.includes(other.id);
  const n = Number(value);
  const valid = Number.isInteger(n) && n >= 1 && n <= match.max;

  function choose() {
    if (!valid || busy) return;
    setSent(n);
    void send(() => playAction(night.id, { game: 'numero', pick: n }));
  }

  const myPick = match.picks?.[me.id] ?? sent;

  return (
    <section>
      <GameHeader table={table} pending={pending} name="El número secreto" detail={`Del 1 al ${match.max}. Gana el más cercano al que sale.`} />

      <AnimatePresence mode="wait">
        {match.target !== undefined && match.picks ? (
          <motion.div key="reveal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="tarjeta flex flex-col items-center gap-4 px-6 py-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tinta-suave">Salió</p>
            <p className="font-cartel text-7xl leading-none text-acento">{match.target}</p>
            <div className="flex gap-8">
              {[me, other].map((p) => {
                const pick = match.picks![p.id];
                return (
                  <span key={p.id} className="flex flex-col items-center gap-1 text-xs text-tinta-suave">
                    <Avatar persona={p} />
                    <span className="font-cartel text-3xl leading-none" style={{ color: varColor(p.color) }}>
                      {pick ?? '—'}
                    </span>
                    {pick !== undefined && <span>a {Math.abs(pick - match.target!)}</span>}
                  </span>
                );
              })}
            </div>
          </motion.div>
        ) : picked ? (
          <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tarjeta flex flex-col items-center gap-3 px-6 py-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tinta-suave">Tu número</p>
            <p className="font-cartel text-7xl leading-none" style={{ color: varColor(me.color) }}>
              {myPick ?? '?'}
            </p>
            <p className="flex items-center justify-center gap-1.5 text-sm text-tinta-suave">
              <Avatar persona={other} medida="chico" vacio={!otherPicked} />
              {otherPicked ? 'Eligieron los dos. Sacando el número…' : `Esperando a que elija ${other.nombre}…`}
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="pick"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              choose();
            }}
          >
            <p className="flex items-center gap-1.5 text-sm text-tinta-suave">
              <Avatar persona={other} medida="chico" vacio={!otherPicked} />
              {otherPicked ? `${other.nombre} ya eligió. Te toca.` : 'Que no te vea la pantalla.'}
            </p>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={match.max}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="42"
              aria-label={`Un número del 1 al ${match.max}`}
              className="foco w-40 rounded-tema border-2 border-borde bg-superficie px-3 py-2 text-center font-cartel text-5xl text-tinta outline-none focus:border-acento"
            />
            <Boton type="submit" disabled={!valid || busy} className="h-11 px-6">
              Elegir
            </Boton>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}
