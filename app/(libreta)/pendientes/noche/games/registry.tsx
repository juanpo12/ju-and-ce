import type { ComponentType, ReactNode } from 'react';
import type { ModularGame } from '@/lib/movie-night';
import type { Pendiente } from '@/db/queries';
import type { Table } from '../types';
import { OddsOrEvens, meta as paresMeta } from './OddsOrEvens';
import { Undercut, meta as porunoMeta } from './Undercut';
import { StealOrShare, meta as robarMeta } from './StealOrShare';
import { Auction, meta as subastaMeta } from './Auction';
import { Reversi, meta as reversiMeta } from './Reversi';
import { FiveInARow, meta as cincoMeta } from './FiveInARow';
import { Mancala, meta as mancalaMeta } from './Mancala';
import { Generala, meta as generalaMeta } from './Generala';
import { LiarsDice, meta as mentirosoMeta } from './LiarsDice';
import { Duel, meta as dueloMeta } from './Duel';
import { Colors, meta as coloresMeta } from './Colors';
import { Anagram, meta as anagramaMeta } from './Anagram';
import { DrawAndGuess, meta as dibujoMeta } from './DrawAndGuess';
import { KnowMe, meta as conocerMeta } from './KnowMe';

// Each screen narrows `match` to its own type; the registry only passes it through.
type ModularScreen = ComponentType<{ table: Table; match: never; pending: Pendiente[] }>;

/**
 * The screens of the modular games, with what the lobby shows for each: a
 * one-line description and the inside of a 24×24 line icon.
 */
export const SCREENS: Record<ModularGame, { Component: ModularScreen; description: string; icon: ReactNode }> = {
  pares: { Component: OddsOrEvens as ModularScreen, ...paresMeta },
  poruno: { Component: Undercut as ModularScreen, ...porunoMeta },
  robar: { Component: StealOrShare as ModularScreen, ...robarMeta },
  subasta: { Component: Auction as ModularScreen, ...subastaMeta },
  reversi: { Component: Reversi as ModularScreen, ...reversiMeta },
  cinco: { Component: FiveInARow as ModularScreen, ...cincoMeta },
  mancala: { Component: Mancala as ModularScreen, ...mancalaMeta },
  generala: { Component: Generala as ModularScreen, ...generalaMeta },
  mentiroso: { Component: LiarsDice as ModularScreen, ...mentirosoMeta },
  duelo: { Component: Duel as ModularScreen, ...dueloMeta },
  colores: { Component: Colors as ModularScreen, ...coloresMeta },
  anagrama: { Component: Anagram as ModularScreen, ...anagramaMeta },
  dibujo: { Component: DrawAndGuess as ModularScreen, ...dibujoMeta },
  conocer: { Component: KnowMe as ModularScreen, ...conocerMeta },
};
