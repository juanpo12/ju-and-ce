import { randomInt } from 'node:crypto';

/**
 * El azar entra por acá para que la lógica de los juegos sea determinística en
 * las pruebas: en producción es `crypto`, en los tests una semilla.
 */
export type Azar = {
  /** Un entero en [0, n). */
  entero(n: number): number;
};

export function azarSeguro(): Azar {
  return { entero: (n) => randomInt(n) };
}

/** mulberry32: chico, rápido y suficiente para barajar en un test. */
export function azarSemilla(semilla: number): Azar {
  let a = semilla >>> 0;
  return {
    entero(n) {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      const u = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      return Math.floor(u * n);
    },
  };
}

export function elegirUno<T>(items: readonly T[], azar: Azar): T {
  if (items.length === 0) throw new Error('No hay de dónde elegir');
  return items[azar.entero(items.length)]!;
}

/** Fisher–Yates, sobre una copia. */
export function barajar<T>(items: readonly T[], azar: Azar): T[] {
  const copia = [...items];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = azar.entero(i + 1);
    [copia[i], copia[j]] = [copia[j]!, copia[i]!];
  }
  return copia;
}
