'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { esDemo } from '@/lib/demo';
import { joinNightAction, readNightAction } from '@/app/acciones';
import type { Game, Mode, NightState, Phase, PublicNight } from '@/lib/movie-night';
import type { Persona } from '@/lib/personas';
import type { Pendiente } from '@/db/queries';
import type { Send, Table } from './types';
import { Lobby } from './Lobby';
import { Outcome } from './Outcome';
import { RockPaperScissors } from './games/RockPaperScissors';
import { Memory } from './games/Memory';
import { Hangman } from './games/Hangman';
import { Wordle } from './games/Wordle';
import { TicTacToe } from './games/TicTacToe';
import { Dice } from './games/Dice';
import { Trivia } from './games/Trivia';
import { HigherLower } from './games/HigherLower';
import { ConnectFour } from './games/ConnectFour';
import { Nim } from './games/Nim';
import { Boxes } from './games/Boxes';
import { CursedCard } from './games/CursedCard';
import { TapRace } from './games/TapRace';
import { SecretNumber } from './games/SecretNumber';
import { Simon } from './games/Simon';
import { Battleship } from './games/Battleship';
import { PosterGuess } from './games/PosterGuess';
import { Timeline } from './games/Timeline';

/**
 * The duo session, live. The `noches` row lives here in state: every action
 * returns the new row (so the one who plays does not wait for the websocket)
 * and the Realtime channel brings the other person's. A row is adopted only
 * when its `version` is higher: events can arrive out of order.
 *
 * It deliberately does not go through `EscuchaCambios`: a `router.refresh()`
 * per move would re-render the whole page on the server for every card.
 */
export function NightSession({
  initial,
  me,
  other,
  spaceId,
  pending,
  availability,
}: {
  initial: PublicNight;
  me: Persona;
  other: Persona;
  spaceId: string;
  pending: Pendiente[];
  availability: Record<Game, string | null>;
}) {
  const [night, setNight] = useState(initial);
  const [busy, start] = useTransition();
  const current = useRef(night);
  current.current = night;

  const adopt = useCallback((next: PublicNight) => {
    setNight((prev) => (next.id !== prev.id || next.version > prev.version ? next : prev));
  }, []);

  // If the server re-rendered with a newer row (a refresh), that counts too.
  const [lastInitial, setLastInitial] = useState(initial);
  if (initial !== lastInitial) {
    setLastInitial(initial);
    adopt(initial);
  }

  const send: Send = useCallback(
    (action, options) =>
      new Promise((done) => {
        start(async () => {
          let error: string | null = null;
          try {
            const r = await action();
            if ('error' in r) error = r.error;
            else adopt(r.night);
          } catch (e) {
            console.error('[night]', e);
            error = 'Algo falló. Probá de nuevo.';
          }
          if (error && !options?.quiet) toast(error);
          done(error);
        });
      }),
    [adopt],
  );

  // Joining: if the other person opened it and I am not in yet, I join on arrival.
  const joined = useRef<string | null>(null);
  useEffect(() => {
    const present = night.state.present ?? [];
    if (night.phase !== 'esperando' || present.includes(me.id) || joined.current === night.id) return;
    joined.current = night.id;
    void send(() => joinNightAction(night.id));
  }, [night.id, night.phase, night.state.present, me.id, send]);

  // Re-read the row: when the channel connects, and when coming back from the
  // background (iOS drops the websocket when the screen goes off).
  const resync = useCallback(async () => {
    const fresh = await readNightAction(current.current.id).catch(() => null);
    if (fresh) adopt(fresh);
  }, [adopt]);

  useEffect(() => {
    if (esDemo) return;
    const supabase = crearClienteNavegador();
    const channel = supabase
      .channel(`noche:${spaceId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'noches', filter: `espacio_id=eq.${spaceId}` },
        (p) => {
          const row = fromRow(p.new as Record<string, unknown>);
          if (row) adopt(row);
          else void resync();
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') void resync();
      });

    const onVisible = () => {
      if (document.visibilityState === 'visible') void resync();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(channel);
    };
  }, [spaceId, adopt, resync]);

  const present = night.state.present ?? [];
  const second = present.find((p) => p !== night.createdBy) ?? (night.createdBy === me.id ? other.id : me.id);
  const table: Table = { night, me, other, players: [night.createdBy, second], send, busy };

  switch (night.phase) {
    case 'esperando':
    case 'candidatas':
    case 'juego':
      return <Lobby table={table} pending={pending} availability={availability} />;
    case 'jugando': {
      const match = night.state.match;
      if (!match) return null;
      switch (match.game) {
        case 'ppt':
          return <RockPaperScissors table={table} match={match} pending={pending} />;
        case 'memoria':
          return <Memory table={table} match={match} pending={pending} />;
        case 'ahorcado':
          return <Hangman table={table} match={match} pending={pending} />;
        case 'wordle':
          return <Wordle table={table} match={match} pending={pending} />;
        case 'tateti':
          return <TicTacToe table={table} match={match} pending={pending} />;
        case 'dados':
          return <Dice table={table} match={match} pending={pending} />;
        case 'trivia':
          return <Trivia table={table} match={match} pending={pending} />;
        case 'mayormenor':
          return <HigherLower table={table} match={match} pending={pending} />;
        case 'cuatro':
          return <ConnectFour table={table} match={match} pending={pending} />;
        case 'nim':
          return <Nim table={table} match={match} pending={pending} />;
        case 'cajas':
          return <Boxes table={table} match={match} pending={pending} />;
        case 'carta':
          return <CursedCard table={table} match={match} pending={pending} />;
        case 'taps':
          return <TapRace table={table} match={match} pending={pending} />;
        case 'numero':
          return <SecretNumber table={table} match={match} pending={pending} />;
        case 'simon':
          return <Simon table={table} match={match} pending={pending} />;
        case 'naval':
          return <Battleship table={table} match={match} pending={pending} />;
        case 'poster':
          return <PosterGuess table={table} match={match} pending={pending} />;
        case 'linea':
          return <Timeline table={table} match={match} pending={pending} />;
        default:
          return null;
      }
    }
    case 'terminada':
    case 'cancelada':
      return <Outcome table={table} pending={pending} />;
  }
}

/** The row as Realtime sends it (snake_case, dates as text), without the secret. */
function fromRow(f: Record<string, unknown>): PublicNight | null {
  if (typeof f.id !== 'string' || typeof f.version !== 'number' || typeof f.fase !== 'string') return null;
  const date = (v: unknown) => (typeof v === 'string' ? new Date(v) : null);
  return {
    id: f.id,
    spaceId: String(f.espacio_id),
    mode: f.modo as Mode,
    phase: f.fase as Phase,
    game: (f.juego ?? null) as Game | null,
    createdBy: String(f.creada_por),
    winnerId: (f.ganador_id ?? null) as string | null,
    entryId: (f.entrada_id ?? null) as string | null,
    state: (f.estado ?? {}) as NightState,
    version: f.version,
    createdAt: date(f.creada_en) ?? new Date(),
    updatedAt: date(f.actualizada_en) ?? new Date(),
    finishedAt: date(f.terminada_en),
  };
}
