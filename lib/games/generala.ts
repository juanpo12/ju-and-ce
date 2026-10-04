import type { GameModule } from './module';
import type { Rng } from './random';
import { GameError } from './error';

export const CATEGORIES = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'escalera', 'full', 'poker', 'generala', 'doble'] as const;
export type Category = (typeof CATEGORIES)[number];

export const MAX_ROLLS = 3;
export const DICE = 5;

export type GeneralaSheet = Partial<Record<Category, number>>;

export type GeneralaMatch = {
  game: 'generala';
  turn: string;
  /** The five dice of the current turn; empty before its first roll. */
  dice: number[];
  /** Which dice are kept on the next roll. */
  held: boolean[];
  /** Rolls already used this turn (0 to 3). */
  rolls: number;
  sheets: Record<string, GeneralaSheet>;
  /** The latest scoring, to show what the other one just did. */
  last?: { by: string; category: Category; points: number };
  /** Who won with a generala servida, if that is how it ended. */
  servida?: string;
};

export type GeneralaMove =
  | { game: 'generala'; action: 'roll'; hold: boolean[] }
  | { game: 'generala'; action: 'score'; category: Category };

const counts = (dice: number[]) => {
  const c = [0, 0, 0, 0, 0, 0, 0];
  for (const d of dice) c[d]!++;
  return c;
};

export const isGenerala = (dice: number[]) => dice.length === DICE && counts(dice).some((n) => n === DICE);

function isStraight(dice: number[]) {
  const key = [...dice].sort((a, b) => a - b).join('');
  // 1-2-3-4-5, 2-3-4-5-6, and 3-4-5-6 with the 1 closing it on top.
  return key === '12345' || key === '23456' || key === '13456';
}

/**
 * What the dice are worth in a category. `served` is the first roll of the
 * turn: escalera, full and póker pay 5 more. Doble generala only pays once a
 * generala was scored for 50; otherwise it is a scratch.
 */
export function points(dice: number[], category: Category, served: boolean, sheet: GeneralaSheet): number {
  if (dice.length !== DICE) return 0;
  const c = counts(dice);
  const bonus = served ? 5 : 0;
  switch (category) {
    case 'c1':
    case 'c2':
    case 'c3':
    case 'c4':
    case 'c5':
    case 'c6': {
      const face = Number(category[1]);
      return c[face]! * face;
    }
    case 'escalera':
      return isStraight(dice) ? 20 + bonus : 0;
    case 'full':
      return c.includes(3) && c.includes(2) ? 30 + bonus : 0;
    case 'poker':
      return c.some((n) => n >= 4) ? 40 + bonus : 0;
    case 'generala':
      return isGenerala(dice) ? 50 : 0;
    case 'doble':
      return isGenerala(dice) && sheet.generala === 50 ? 100 : 0;
  }
}

export const total = (sheet: GeneralaSheet) => Object.values(sheet).reduce((s, p) => s + (p ?? 0), 0);

const roll = (rng: Rng) => rng.int(6) + 1;

/**
 * Generala, by turns: up to three rolls keeping the dice you want, then score
 * in a free category (or scratch one for 0). Eleven turns each, more points
 * wins. A generala on the first roll (servida) wins on the spot.
 */
const generala: GameModule<GeneralaMatch, GeneralaMove> = {
  start: ({ players, starter }) => ({
    match: {
      game: 'generala',
      turn: starter,
      dice: [],
      held: [false, false, false, false, false],
      rolls: 0,
      sheets: { [players[0]]: {}, [players[1]]: {} },
    },
    secret: null,
  }),

  apply({ match, me, move, players, rng }) {
    if (match.turn !== me) throw new GameError('No es tu turno.');

    if (move.action === 'roll') {
      if (match.rolls >= MAX_ROLLS) throw new GameError('Ya tiraste tres veces: anotá.');
      if (match.rolls > 0 && move.hold.every(Boolean)) throw new GameError('Soltá algún dado para volver a tirar.');
      const dice =
        match.rolls === 0
          ? Array.from({ length: DICE }, () => roll(rng))
          : match.dice.map((d, i) => (move.hold[i] ? d : roll(rng)));
      const rolls = match.rolls + 1;
      const next: GeneralaMatch = { ...match, dice, rolls, held: match.rolls === 0 ? [false, false, false, false, false] : move.hold };
      if (rolls === 1 && isGenerala(dice)) {
        return { match: { ...next, servida: me }, secret: null, end: { winnerId: me } };
      }
      return { match: next, secret: null };
    }

    if (match.rolls === 0) throw new GameError('Primero tirá los dados.');
    const sheet = match.sheets[me] ?? {};
    if (sheet[move.category] !== undefined) throw new GameError('Esa ya la anotaste.');
    const got = points(match.dice, move.category, match.rolls === 1, sheet);
    const sheets = { ...match.sheets, [me]: { ...sheet, [move.category]: got } };
    const other = players[0] === me ? players[1] : players[0];
    const next: GeneralaMatch = {
      ...match,
      turn: other,
      dice: [],
      held: [false, false, false, false, false],
      rolls: 0,
      sheets,
      last: { by: me, category: move.category, points: got },
    };

    const done = players.every((p) => Object.keys(sheets[p] ?? {}).length === CATEGORIES.length);
    if (!done) return { match: next, secret: null };
    const [a, b] = players;
    const ta = total(sheets[a]!);
    const tb = total(sheets[b]!);
    return { match: next, secret: null, end: { winnerId: ta === tb ? null : ta > tb ? a : b } };
  },

  isValidMove: (o) =>
    (o.action === 'roll' && Array.isArray(o.hold) && o.hold.length === DICE && o.hold.every((h) => typeof h === 'boolean')) ||
    (o.action === 'score' && typeof o.category === 'string' && (CATEGORIES as readonly string[]).includes(o.category)),
};

export default generala;
