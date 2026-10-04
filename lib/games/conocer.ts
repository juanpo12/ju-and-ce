import type { GameModule } from './module';
import { GameError } from './error';
import { KNOW_ME_QUESTIONS } from './conocer-questions';

export const KNOW_ME_ROUNDS = 6;

export type ConocerRound = {
  question: string;
  options: string[];
  /** Who answers about themselves. */
  subject: string;
  /** Who guesses what the subject answered. */
  guesser: string;
  /** Who already chose (not what), until both are in. */
  chosen: string[];
  /** Revealed when both chose. */
  answer?: number;
  guess?: number;
};

export type ConocerMatch = {
  game: 'conocer';
  rounds: ConocerRound[];
  total: number;
  score: Record<string, number>;
};

export type ConocerMove = { game: 'conocer'; choice: number };

type ConocerSecret = { picks: Record<string, number>; used: number[] };

function newRound(subject: string, guesser: string, used: number[], rng: { int(n: number): number }) {
  const free = KNOW_ME_QUESTIONS.map((_, i) => i).filter((i) => !used.includes(i));
  const index = free[rng.int(free.length)]!;
  const { q, options } = KNOW_ME_QUESTIONS[index]!;
  const round: ConocerRound = { question: q, options: [...options], subject, guesser, chosen: [] };
  return { round, used: [...used, index] };
}

/**
 * One answers a question about themselves, the other guesses what they
 * answered; both choices stay in the secret until both are in. A right guess
 * is a point for the guesser. Roles alternate, so each guesses the same
 * number of times.
 */
const conocer: GameModule<ConocerMatch, ConocerMove, ConocerSecret> = {
  start({ players, starter }, rng) {
    const other = players[0] === starter ? players[1] : players[0];
    // The starter guesses first: the other one answers about themselves.
    const { round, used } = newRound(other, starter, [], rng);
    return {
      match: { game: 'conocer', rounds: [round], total: KNOW_ME_ROUNDS, score: { [players[0]]: 0, [players[1]]: 0 } },
      secret: { picks: {}, used },
    };
  },

  apply({ match, secret, me, move, players, rng }) {
    const round = match.rounds[match.rounds.length - 1]!;
    if (round.answer !== undefined) throw new GameError('Esa pregunta ya se respondió.');
    if (round.chosen.includes(me)) throw new GameError('Ya elegiste. Esperá a la otra persona.');
    if (!Number.isInteger(move.choice) || move.choice < 0 || move.choice >= round.options.length) {
      throw new GameError('Esa opción no existe.');
    }

    const picks = { ...secret.picks, [me]: move.choice };
    const chosen = [...round.chosen, me];
    const replace = (r: ConocerRound) => [...match.rounds.slice(0, -1), r];
    if (picks[round.subject] === undefined || picks[round.guesser] === undefined) {
      return { match: { ...match, rounds: replace({ ...round, chosen }) }, secret: { ...secret, picks } };
    }

    const answer = picks[round.subject]!;
    const guess = picks[round.guesser]!;
    const score = { ...match.score };
    if (answer === guess) score[round.guesser] = (score[round.guesser] ?? 0) + 1;
    const rounds = replace({ ...round, chosen, answer, guess });

    if (rounds.length >= match.total) {
      const [a, b] = players;
      const winnerId = score[a] === score[b] ? null : score[a]! > score[b]! ? a : b;
      return { match: { ...match, rounds, score }, secret: { ...secret, picks: {} }, end: { winnerId } };
    }
    const next = newRound(round.guesser, round.subject, secret.used, rng);
    return {
      match: { ...match, rounds: [...rounds, next.round], score },
      secret: { picks: {}, used: next.used },
    };
  },

  isValidMove: (o) =>
    Object.keys(o).length === 2 && typeof o.choice === 'number' && Number.isInteger(o.choice) && o.choice >= 0 && o.choice < 4,
};

export default conocer;
