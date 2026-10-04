'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import { matching, raises, type MentirosoMatch } from '@/lib/games/mentiroso';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { DieFace } from './Generala';
import { usePrivateView } from './usePrivateView';
import { personOf, type Table } from '../types';

export const meta = {
  description: 'Cada uno ve solo sus dados. Apuestan cuántos hay de una cara en toda la mesa, o gritan «¡Mentira!». Los 1 son comodines.',
  icon: (
    <>
      <rect x="3" y="7" width="10" height="10" rx="2.5" />
      <circle cx="6" cy="10" r="0.9" fill="currentColor" />
      <circle cx="10" cy="14" r="0.9" fill="currentColor" />
      <path d="M15.5 6.5h5.5v5h-2.2l-1.8 2v-2h-1.5z" />
      <path d="M18.2 8.2v.9M18.2 10.2v.01" />
    </>
  ),
};

/**
 * Liar's dice for two. Your dice come privately from the server; the other
 * one's stay as question marks until someone calls «¡Mentira!». Then the round
 * is revealed for both, and whoever was wrong loses a die.
 */
export function LiarsDice({ table, match, pending }: { table: Table; match: MentirosoMatch; pending: Pendiente[] }) {
  const { me, other, play, busy } = table;
  const myDice = usePrivateView<number[]>(table) ?? [];
  const mine = match.turn === me.id;
  const onTable = (match.counts[me.id] ?? 0) + (match.counts[other.id] ?? 0);
  const current = match.bids[match.bids.length - 1];
  const reveal = match.bids.length === 0 ? match.reveals[match.reveals.length - 1] : undefined;

  // The bid being composed: starts at the lowest raise over the current one.
  const minimum = current
    ? current.face < 6
      ? { qty: current.qty, face: current.face + 1 }
      : { qty: current.qty + 1, face: 2 }
    : { qty: 1, face: 2 };
  const [draft, setDraft] = useState<{ key: string; qty: number; face: number }>({ key: '', ...minimum });
  const key = `${match.round}-${match.bids.length}`;
  const bid = draft.key === key ? draft : { key, ...minimum };
  const valid = raises(current, bid.qty, bid.face) && bid.qty <= onTable;
  const set = (qty: number, face: number) => setDraft({ key, qty: Math.max(1, Math.min(onTable, qty)), face });

  return (
    <section>
      <GameHeader table={table} pending={pending} name="Dados mentirosos" detail={`Ronda ${match.round} · ${onTable} dados en la mesa`} />

      <AnimatePresence initial={false}>
        {reveal && (
          <motion.div
            key={`reveal-${match.reveals.length}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="tarjeta mb-4 flex flex-col gap-3 px-3 py-4"
          >
            <p className="text-center font-titulo text-2xl leading-tight text-tinta">
              {reveal.caller === me.id ? 'Gritaste' : `${personOf(table, reveal.caller)?.nombre} gritó`} «¡Mentira!»
            </p>
            <p className="text-center text-sm text-tinta-suave">
              {personOf(table, reveal.bid.by)?.id === me.id ? 'Apostaste' : `${personOf(table, reveal.bid.by)?.nombre} apostó`}{' '}
              {reveal.bid.qty} de <FaceWord face={reveal.bid.face} /> y había <strong className="text-tinta">{reveal.matched}</strong>
              {reveal.bid.face !== 1 && ' contando los 1'}.{' '}
              <strong className="text-tinta">
                {reveal.loser === me.id ? 'Perdés un dado.' : `${personOf(table, reveal.loser)?.nombre} pierde un dado.`}
              </strong>
            </p>
            {[me, other].map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <Avatar persona={p} medida="chico" />
                <div className="flex flex-wrap gap-1">
                  {(reveal.dice[p.id] ?? []).map((d, i) => (
                    <DieFace
                      key={i}
                      value={d}
                      color={varColor(p.color)}
                      size="size-8"
                      animate={false}
                      highlight={matching([d], reveal.bid.face) === 1}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="tarjeta mb-4 flex flex-col gap-3 px-3 py-4">
        <Hand
          label={`${other.nombre} · ${match.counts[other.id]} ${match.counts[other.id] === 1 ? 'dado' : 'dados'}`}
          persona={other}
        >
          {Array.from({ length: match.counts[other.id] ?? 0 }, (_, i) => (
            <span
              key={i}
              className="flex size-10 items-center justify-center rounded-[0.6rem] border-[1.6px] border-dashed font-cartel text-xl text-tinta-suave"
              style={{ borderColor: varColor(other.color) }}
              aria-hidden
            >
              ?
            </span>
          ))}
        </Hand>
        <Hand label={`Vos · ${match.counts[me.id]} ${match.counts[me.id] === 1 ? 'dado' : 'dados'}`} persona={me}>
          {(myDice.length ? myDice : Array.from({ length: match.counts[me.id] ?? 0 }, () => 0)).map((d, i) => (
            <DieFace
              key={i}
              value={d || undefined}
              color={varColor(me.color)}
              size="size-10"
              rollKey={`${match.round}-${i}`}
              highlight={!!current && !!d && matching([d], current.face) === 1}
            />
          ))}
        </Hand>
      </div>

      <div className="mb-4 text-center">
        {current ? (
          <>
            <p className="text-xs uppercase tracking-[0.18em] text-tinta-suave">
              {current.by === me.id ? 'Tu apuesta' : `Apuesta de ${personOf(table, current.by)?.nombre}`}
            </p>
            <p className="mt-1 flex items-center justify-center gap-2 font-titulo text-4xl leading-none text-tinta">
              <span>Hay {current.qty}</span>
              <DieFace value={current.face} color="var(--acento)" size="size-10" animate={false} />
            </p>
            <p className="mt-1 text-xs text-tinta-suave">o más, en toda la mesa</p>
          </>
        ) : (
          <p className="text-sm text-tinta-suave">
            {mine ? 'Abrís vos: apostá cuántos hay de una cara.' : `Abre ${personOf(table, match.turn)?.nombre}.`}
          </p>
        )}
      </div>

      {mine ? (
        <div className="tarjeta flex flex-col items-center gap-4 px-3 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set(bid.qty - 1, bid.face)}
              disabled={bid.qty <= 1}
              className="foco tocable flex size-10 items-center justify-center rounded-full border border-borde text-tinta disabled:opacity-40"
              aria-label="Un dado menos"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-24 text-center font-titulo text-4xl leading-none text-tinta" aria-live="polite">
              {bid.qty} <span className="text-lg text-tinta-suave">de</span>
            </span>
            <button
              type="button"
              onClick={() => set(bid.qty + 1, bid.face)}
              disabled={bid.qty >= onTable}
              className="foco tocable flex size-10 items-center justify-center rounded-full border border-borde text-tinta disabled:opacity-40"
              aria-label="Un dado más"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5" role="radiogroup" aria-label="Cara">
            {[1, 2, 3, 4, 5, 6].map((f) => (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={bid.face === f}
                aria-label={`Cara ${f}`}
                onClick={() => set(bid.qty, f)}
                className={cn('foco tocable rounded-[0.7rem] p-0.5', bid.face === f && 'ring-2 ring-acento')}
              >
                <DieFace value={f} color="var(--tinta)" size="size-10" animate={false} highlight={bid.face === f} />
              </button>
            ))}
          </div>
          <div className="flex w-full flex-wrap justify-center gap-2">
            <Boton disabled={busy || !valid} onClick={() => play({ game: 'mentiroso', action: 'bid', qty: bid.qty, face: bid.face })} className="h-11 px-5">
              Apostar {bid.qty} de {bid.face}
            </Boton>
            {current && current.by !== me.id && (
              <Boton variante="secundario" disabled={busy} onClick={() => play({ game: 'mentiroso', action: 'call' })} className="h-11 px-5">
                ¡Mentira!
              </Boton>
            )}
          </div>
          {!valid && <p className="text-xs text-tinta-suave">Tenés que subir: más dados, o una cara más alta.</p>}
        </div>
      ) : (
        <p className="tarjeta px-4 py-5 text-center text-sm text-tinta-suave">
          <Avatar persona={other} medida="chico" className="mr-1 inline-flex align-middle" />
          {other.nombre} está pensando: ¿sube o te desmiente?
        </p>
      )}

      {match.bids.length > 1 && (
        <ol className="mt-4 flex flex-wrap justify-center gap-1.5 text-xs text-tinta-suave" aria-label="Apuestas de esta ronda">
          {match.bids.map((b, i) => (
            <li key={i} className="flex items-center gap-1 rounded-full border border-borde px-2 py-0.5">
              <Avatar persona={personOf(table, b.by)!} medida="chico" />
              {b.qty} de {b.face}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Hand({ label, persona, children }: { label: string; persona: Table['me']; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-xs text-tinta-suave">
        <Avatar persona={persona} medida="chico" />
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

const FACES = ['', 'unos', 'doses', 'treses', 'cuatros', 'cincos', 'seises'];
function FaceWord({ face }: { face: number }) {
  return <>{FACES[face]}</>;
}
