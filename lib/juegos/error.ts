/**
 * Una jugada que las reglas no permiten: no es tu turno, esa letra ya salió,
 * esa palabra no existe. No es un bug: la acción la convierte en `{ error }` y
 * la pantalla lo dice.
 */
export class ErrorDeJuego extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorDeJuego';
  }
}
