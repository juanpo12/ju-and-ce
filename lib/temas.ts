/**
 * Los hex que JavaScript necesita saber: el color de la barra del navegador y las
 * muestras de Ajustes. Las dos cosas tienen que mostrar un tema que puede no ser
 * el activo, y una variable CSS siempre resuelve al activo.
 *
 * Tienen que coincidir con `styles/temas.css`, que es donde manda el tema.
 */

export const TEMAS = ['papel', 'bullet', 'menta', 'hadas', 'pradera', 'acuarela', 'dragon'] as const;
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
  hadas: {
    nombre: 'Jardín de hadas',
    claro: { fondo: '#eeeed6', acento: '#6c5596', tinta: '#24261a' },
    oscuro: { fondo: '#13170f', acento: '#b9a5e8', tinta: '#eef0de' },
  },
  pradera: {
    nombre: 'Pradera de luz',
    claro: { fondo: '#eff5e9', acento: '#b03f63', tinta: '#26301f' },
    oscuro: { fondo: '#121812', acento: '#f29bb6', tinta: '#eef5ea' },
  },
  acuarela: {
    nombre: 'Acuarela y estrellas',
    claro: { fondo: '#f1eadb', acento: '#4f6d3a', tinta: '#27241c' },
    oscuro: { fondo: '#171a14', acento: '#a4c98a', tinta: '#f1ecdf' },
  },
  dragon: {
    nombre: 'Guarida del dragón',
    claro: { fondo: '#f3e4cf', acento: '#b0406f', tinta: '#26211a' },
    oscuro: { fondo: '#1a1512', acento: '#f39ac0', tinta: '#f5ebdd' },
  },
};

export function temaValido(tema: string | null | undefined): Tema {
  return TEMAS.includes(tema as Tema) ? (tema as Tema) : 'papel';
}
