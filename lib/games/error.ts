/**
 * A move the rules do not allow: not your turn, that letter already came out,
 * that word does not exist. Not a bug: the action turns it into `{ error }`
 * and the screen says so. The message is what the user reads, so it is in
 * Spanish.
 */
export class GameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameError';
  }
}
