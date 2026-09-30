/**
 * Los hex que JavaScript necesita saber: el color de la barra del navegador y las
 * muestras de Ajustes. Las dos cosas tienen que mostrar un tema que puede no ser
 * el activo, y una variable CSS siempre resuelve al activo.
 *
 * Tienen que coincidir con `styles/temas.css`, que es donde manda el tema.
 */

export const TEMAS = ['papel', 'bullet', 'menta'] as const;
export type Tema = (typeof TEMAS)[number];
export type Modo = 'claro' | 'oscuro';

type Muestra = { fondo: string; acento: string; tinta: string };

export const PALETAS: Record<Tema, { nombre: string; claro: Muestra; oscuro: Muestra }> = {
  papel: {
    nombre: 'Papel y washi',
    claro: { fondo: '#f5efe1', acento: '#b44d28', tinta: '#2b2620' },
    oscuro: { fondo: '#1c1714', acento: '#e8894f', tinta: '#f3ebdf' },
  },
  bullet: {
    nombre: 'Bullet journal',
    claro: { fondo: '#fbfaf7', acento: '#6a57b8', tinta: '#35323f' },
    oscuro: { fondo: '#14141d', acento: '#ab9cf0', tinta: '#eeecf6' },
  },
  menta: {
    nombre: 'Menta granizada',
    claro: { fondo: '#e4f2ea', acento: '#17795c', tinta: '#2a231d' },
    oscuro: { fondo: '#111a16', acento: '#5cc79d', tinta: '#ebf4ef' },
  },
};

export function temaValido(tema: string | null | undefined): Tema {
  return TEMAS.includes(tema as Tema) ? (tema as Tema) : 'papel';
}
