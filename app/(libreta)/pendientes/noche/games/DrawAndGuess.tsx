'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Undo2, Eraser, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import {
  CANVAS,
  MAX_STROKE_POINTS,
  type DibujoMatch,
  type Stroke,
  type StrokeColor,
} from '@/lib/games/dibujo';
import { varColor } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { Pendiente } from '@/db/queries';
import { GameHeader } from './GameHeader';
import { usePrivateView } from './usePrivateView';
import { personOf, type Table } from '../types';

export const meta = {
  description: 'Uno dibuja, el otro adivina contra reloj. Se turnan cuatro rondas: cuanto más rápido, más puntos.',
  icon: (
    <>
      <path d="M4 20l1.2-4.2L15.8 5.2a2 2 0 0 1 2.9 0l.1.1a2 2 0 0 1 0 2.9L8.2 18.8z" />
      <path d="M14 7l3 3M4 20l4.2-1.2" />
    </>
  ),
};

const REVEAL_MS = 2600;
const PEN_COLORS: StrokeColor[] = ['tinta', 'acento', 'durazno', 'menta'];
const WIDTHS = [6, 14, 28];
/** The eraser paints with the board's own color. */
const colorVar = (c: StrokeColor) => (c === 'borrar' ? 'var(--superficie)' : `var(--${c})`);

/**
 * One draws, the other guesses. The word reaches only the drawer (private
 * view); each finished stroke is sent once, normalized to a 0–1000 square, so
 * both phones draw the same picture at any size.
 */
export function DrawAndGuess({ table, match, pending }: { table: Table; match: DibujoMatch; pending: Pendiente[] }) {
  const { me, other, play, busy } = table;
  const word = usePrivateView<string>(table);
  const round = match.rounds[match.rounds.length - 1]!;
  const drawing = round.drawer === me.id;
  const index = match.rounds.length;

  // A round that just ended is shown for a moment before the next one.
  const finished = match.rounds.filter((r) => r.result).length;
  const [revealed, setRevealed] = useState(finished);
  const revealing = finished > revealed;
  useEffect(() => {
    if (!revealing) return;
    const id = setTimeout(() => setRevealed(finished), REVEAL_MS);
    return () => clearTimeout(id);
  }, [revealing, finished]);
  const lastDone = [...match.rounds].reverse().find((r) => r.result);

  const left = useCountdown(round.startedAt, match.seconds);
  const running = round.startedAt !== null && !round.result;
  const outOfTime = running && left === 0;

  // When the clock runs out, either phone tells the server; it checks the time itself.
  useEffect(() => {
    if (!outOfTime) return;
    let stop = false;
    const tryTimeout = async () => {
      if (stop) return;
      const error = await play({ game: 'dibujo', timeout: true }, { quiet: true });
      if (error && !stop) setTimeout(tryTimeout, 2000);
    };
    const id = setTimeout(tryTimeout, 400);
    return () => {
      stop = true;
      clearTimeout(id);
    };
  }, [outOfTime, play]);

  return (
    <section>
      <GameHeader
        table={table}
        pending={pending}
        name="Dibujá y adiviná"
        detail={`Ronda ${Math.min(index, match.total)} de ${match.total}`}
      />

      <div className="mb-4 flex items-center justify-center gap-6">
        {[me, other].map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <Avatar persona={p} />
            <span className="font-cartel text-2xl leading-none" style={{ color: varColor(p.color) }}>
              {match.score[p.id] ?? 0}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {revealing && lastDone?.result ? (
          <motion.div
            key={`reveal-${finished}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="tarjeta flex flex-col items-center gap-3 px-4 py-6 text-center"
          >
            <p className="text-sm text-tinta-suave">{lastDone.result.guessed ? '¡Adivinó!' : 'Se acabó el tiempo'}</p>
            <p className="font-titulo text-4xl leading-tight text-tinta">Era «{lastDone.result.word}»</p>
            <Board strokes={lastDone.strokes} className="w-40" />
            {lastDone.result.guessed && (
              <p className="flex flex-wrap justify-center gap-3 text-sm text-tinta-suave">
                {Object.entries(lastDone.result.points).map(([id, n]) => {
                  const who = personOf(table, id);
                  return (
                    who && (
                      <span key={id} className="flex items-center gap-1">
                        <Avatar persona={who} medida="chico" /> +{n}
                      </span>
                    )
                  );
                })}
              </p>
            )}
          </motion.div>
        ) : round.startedAt === null ? (
          <motion.div
            key={`ready-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="tarjeta flex flex-col items-center gap-3 px-4 py-8 text-center"
          >
            {drawing ? (
              <>
                <p className="text-sm text-tinta-suave">Te toca dibujar. Que no vea tu pantalla.</p>
                <p className="font-titulo text-5xl leading-tight text-acento">{word ?? '…'}</p>
                <p className="max-w-xs text-xs text-tinta-suave">
                  Sin letras ni números. Tenés {match.seconds} segundos desde que tocás «Empezar».
                </p>
                <Boton className="h-11 px-6" disabled={busy || !word} onClick={() => play({ game: 'dibujo', begin: true })}>
                  Empezar
                </Boton>
              </>
            ) : (
              <>
                <span className="relative flex">
                  <Avatar persona={other} medida="grande" />
                  <span aria-hidden className="absolute -inset-1.5 animate-ping rounded-full border-2 border-acento opacity-50" />
                </span>
                <p className="font-titulo text-3xl text-tinta">{other.nombre} está por dibujar</p>
                <p className="text-sm text-tinta-suave">Prepará los dedos: vos adivinás.</p>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div key={`play-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Clock left={left} total={match.seconds} />
            {drawing ? (
              <DrawerView
                key={index}
                word={word}
                strokes={round.strokes}
                disabled={busy || outOfTime}
                onStroke={(stroke) => play({ game: 'dibujo', stroke })}
                onUndo={() => play({ game: 'dibujo', undo: true })}
                onClear={() => play({ game: 'dibujo', clear: true })}
              />
            ) : (
              <GuesserView
                key={index}
                table={table}
                strokes={round.strokes}
                guesses={round.guesses}
                disabled={busy || outOfTime}
                onGuess={(guess) => play({ game: 'dibujo', guess })}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** Seconds left on the round, ticking locally from the public start time. */
function useCountdown(startedAt: number | null, seconds: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (startedAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [startedAt]);
  if (startedAt === null) return seconds;
  return Math.max(0, Math.ceil(seconds - (now - startedAt) / 1000));
}

function Clock({ left, total }: { left: number; total: number }) {
  const urgent = left <= 10;
  return (
    <div className="mb-3 flex items-center gap-3" role="timer" aria-label={`Quedan ${left} segundos`}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-acento-suave">
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-linear"
          style={{ width: `${(left / total) * 100}%`, backgroundColor: urgent ? 'var(--destructive)' : 'var(--acento)' }}
        />
      </div>
      <span className={cn('w-10 text-right font-cartel text-2xl leading-none tabular-nums', urgent ? 'text-[var(--destructive)]' : 'text-tinta')}>
        {left}
      </span>
    </div>
  );
}

function strokePath(points: number[]) {
  if (points.length === 2) return `M${points[0]} ${points[1]}l0.1 0`;
  let d = `M${points[0]} ${points[1]}`;
  for (let i = 2; i < points.length; i += 2) d += `L${points[i]} ${points[i + 1]}`;
  return d;
}

/** The drawing, as SVG: the same picture on both phones, at any size. */
function Board({
  strokes,
  live,
  className,
  children,
  ...rest
}: {
  strokes: Stroke[];
  live?: Stroke | null;
  className?: string;
  children?: React.ReactNode;
} & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox={`0 0 ${CANVAS} ${CANVAS}`}
      className={cn('aspect-square rounded-tema border-2 border-borde bg-superficie', className)}
      {...rest}
    >
      {[...strokes, ...(live ? [live] : [])].map((s, i) => (
        <path
          key={i}
          d={strokePath(s.points)}
          fill="none"
          stroke={colorVar(s.color)}
          strokeWidth={s.width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {children}
    </svg>
  );
}

/** Drops points too close to the previous one, then thins evenly to fit the cap. */
function simplify(points: number[]): number[] {
  const kept: number[] = [];
  for (let i = 0; i < points.length; i += 2) {
    const x = points[i]!;
    const y = points[i + 1]!;
    const n = kept.length;
    if (n >= 2 && Math.hypot(x - kept[n - 2]!, y - kept[n - 1]!) < 6 && i < points.length - 2) continue;
    kept.push(x, y);
  }
  const max = MAX_STROKE_POINTS / 2;
  const count = kept.length / 2;
  if (count <= max) return kept;
  const out: number[] = [];
  for (let k = 0; k < max; k++) {
    const j = Math.round((k * (count - 1)) / (max - 1)) * 2;
    out.push(kept[j]!, kept[j + 1]!);
  }
  return out;
}

function DrawerView({
  word,
  strokes,
  disabled,
  onStroke,
  onUndo,
  onClear,
}: {
  word: string | null;
  strokes: Stroke[];
  disabled: boolean;
  onStroke: (s: Stroke) => void;
  onUndo: () => void;
  onClear: () => void;
}) {
  const [color, setColor] = useState<StrokeColor>('tinta');
  const [width, setWidth] = useState(WIDTHS[0]!);
  const [live, setLive] = useState<Stroke | null>(null);
  // The stroke just sent stays visible until the match brings it back.
  const [sent, setSent] = useState<{ stroke: Stroke; after: number } | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const shown = sent && strokes.length <= sent.after ? sent.stroke : null;

  function point(e: React.PointerEvent): [number, number] {
    const r = svg.current!.getBoundingClientRect();
    const clamp = (v: number) => Math.min(CANVAS, Math.max(0, Math.round(v)));
    return [clamp(((e.clientX - r.left) / r.width) * CANVAS), clamp(((e.clientY - r.top) / r.height) * CANVAS)];
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-sm text-tinta-suave">
        Dibujá: <strong className="font-titulo text-2xl text-acento">{word ?? '…'}</strong>
      </p>
      <Board
        ref={svg}
        strokes={strokes}
        live={live ?? shown}
        className={cn('w-full touch-none select-none', disabled ? 'opacity-70' : 'cursor-crosshair')}
        style={{ touchAction: 'none' }}
        aria-label="Pizarrón para dibujar"
        onPointerDown={(e) => {
          if (disabled) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          setLive({ color, width: color === 'borrar' ? 40 : width, points: point(e) });
        }}
        onPointerMove={(e) => {
          if (!live) return;
          setLive({ ...live, points: [...live.points, ...point(e)] });
        }}
        onPointerUp={() => {
          if (!live) return;
          const stroke = { ...live, points: simplify(live.points) };
          setSent({ stroke, after: strokes.length });
          setLive(null);
          onStroke(stroke);
        }}
        onPointerCancel={() => setLive(null)}
      />
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {PEN_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`Color ${c}`}
            aria-pressed={color === c}
            className={cn('foco tocable size-8 rounded-full border-2', color === c ? 'border-tinta ring-2 ring-acento ring-offset-2 ring-offset-fondo' : 'border-borde')}
            style={{ backgroundColor: colorVar(c) }}
          />
        ))}
        <button
          type="button"
          onClick={() => setColor('borrar')}
          aria-label="Goma"
          aria-pressed={color === 'borrar'}
          className={cn('foco tocable flex size-8 items-center justify-center rounded-full border-2 text-tinta', color === 'borrar' ? 'border-tinta bg-acento-suave' : 'border-borde')}
        >
          <Eraser className="size-4" aria-hidden />
        </button>
        <span className="mx-0.5 h-6 w-px bg-borde" aria-hidden />
        {WIDTHS.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setWidth(w)}
            aria-label={`Trazo ${w === WIDTHS[0] ? 'fino' : w === WIDTHS[1] ? 'mediano' : 'grueso'}`}
            aria-pressed={width === w}
            className={cn('foco tocable flex size-8 items-center justify-center rounded-full border-2', width === w ? 'border-tinta bg-acento-suave' : 'border-borde')}
          >
            <span className="rounded-full bg-tinta" style={{ width: 3 + w / 3.5, height: 3 + w / 3.5 }} />
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        <Boton variante="secundario" className="h-9 px-3 text-sm" disabled={disabled || strokes.length === 0} onClick={onUndo}>
          <Undo2 className="size-4" aria-hidden /> Deshacer
        </Boton>
        <Boton variante="fantasma" className="h-9 px-3 text-sm" disabled={disabled || strokes.length === 0} onClick={onClear}>
          <Trash2 className="size-4" aria-hidden /> Borrar todo
        </Boton>
      </div>
    </div>
  );
}

function GuesserView({
  table,
  strokes,
  guesses,
  disabled,
  onGuess,
}: {
  table: Table;
  strokes: Stroke[];
  guesses: { text: string; hit: boolean }[];
  disabled: boolean;
  onGuess: (g: string) => Promise<string | null>;
}) {
  const [text, setText] = useState('');
  const wrong = guesses.filter((g) => !g.hit);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-sm text-tinta-suave">
        {strokes.length === 0 ? `${table.other.nombre} está arrancando a dibujar…` : '¿Qué es?'}
      </p>
      <Board strokes={strokes} className="w-full" aria-label="El dibujo" role="img" />
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const guess = text.trim();
          if (!guess) return;
          setText('');
          await onGuess(guess);
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribí tu respuesta"
          aria-label="Tu respuesta"
          maxLength={40}
          autoComplete="off"
          autoCapitalize="off"
          className="foco min-w-0 flex-1 rounded-tema border border-borde bg-superficie px-3 py-2.5 text-base text-tinta outline-none"
        />
        <Boton type="submit" className="h-auto px-4" disabled={disabled || !text.trim()}>
          Adivinar
        </Boton>
      </form>
      {wrong.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-1.5" aria-label="Intentos">
          {wrong.map((g, i) => (
            <li key={i} className="rounded-full border border-borde px-2.5 py-0.5 text-xs text-tinta-suave line-through">
              {g.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
