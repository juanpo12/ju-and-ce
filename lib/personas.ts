import type { PerfilConCompanero } from '@/db/queries';

/**
 * Juan y Ceci, cada uno con su color fijo: el mismo en su celular, en el del
 * otro, en la grilla, en la ficha y en «la sumó». El color sale de
 * `perfiles.color`, no de quién está mirando — si fuera «yo durazno, el otro
 * menta», cada uno se vería a sí mismo del mismo color y el color no diría nada.
 */

export type ColorPersona = 'durazno' | 'menta';
export type Persona = { id: string; nombre: string; color: ColorPersona };

const COLORES: ColorPersona[] = ['durazno', 'menta'];
const esColor = (c: string | null | undefined): c is ColorPersona =>
  COLORES.includes(c as ColorPersona);

/**
 * Si la base no los distingue (los dos con el default, o un valor viejo), se
 * reparten por id: determinístico, así los dos celulares llegan al mismo reparto.
 */
export function personasDe(perfil: PerfilConCompanero): { yo: Persona; otro: Persona | null } {
  const yo = { id: perfil.id, nombre: perfil.nombre, color: perfil.color };
  const otro = perfil.companero;

  if (!otro) {
    return { yo: { ...yo, color: esColor(yo.color) ? yo.color : 'durazno' }, otro: null };
  }
  if (esColor(yo.color) && esColor(otro.color) && yo.color !== otro.color) {
    return { yo: yo as Persona, otro: otro as Persona };
  }
  const yoPrimero = yo.id < otro.id;
  return {
    yo: { ...yo, color: yoPrimero ? 'durazno' : 'menta' },
    otro: { ...otro, color: yoPrimero ? 'menta' : 'durazno' },
  };
}

/** La variable CSS del color, para `style`. Cambia sola con el tema y el modo. */
export const varColor = (c: ColorPersona) => `var(--${c})`;
