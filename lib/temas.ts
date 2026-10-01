/**
 * Los hex que JavaScript necesita saber: el color de la barra del navegador y las
 * muestras de Ajustes. Las dos cosas tienen que mostrar un tema que puede no ser
 * el activo, y una variable CSS siempre resuelve al activo.
 *
 * Tienen que coincidir con `styles/temas.css`, que es donde manda el tema.
 */

export const TEMAS = [
  'papel',
  'bullet',
  'menta',
  'tinta',
  'pizarra',
  'mostaza',
  'cacao',
  'hadas',
  'pradera',
  'acuarela',
  'dragon',
  'hongo',
  'mariposas',
  'campanitas',
  'cine',
  'videoclub',
  'marea',
  'atardecer',
  'frutilla',
  'galaxia',
  'pergamino',
  'castillo',
  'vitral',
  'taberna',
  'heraldica',
  'druidas',
  'alquimia',
] as const;
export type Tema = (typeof TEMAS)[number];
export type Modo = 'claro' | 'oscuro';

/** Para agrupar las muestras en Ajustes: veinte seguidas son demasiadas para elegir. */
export const GRUPOS = [
  { id: 'cuadernos', nombre: 'Cuadernos' },
  { id: 'hadas', nombre: 'De hadas' },
  { id: 'salidas', nombre: 'Salidas' },
  { id: 'medieval', nombre: 'Medievales' },
] as const;
export type Grupo = (typeof GRUPOS)[number]['id'];

type Muestra = { fondo: string; acento: string; tinta: string };

export const PALETAS: Record<Tema, { nombre: string; grupo: Grupo; claro: Muestra; oscuro: Muestra }> = {
  papel: {
    nombre: 'Papel y washi',
    grupo: 'cuadernos',
    claro: { fondo: '#f5efe1', acento: '#b44d28', tinta: '#2b2620' },
    oscuro: { fondo: '#1c1714', acento: '#e8894f', tinta: '#f3ebdf' },
  },
  bullet: {
    nombre: 'Bullet journal',
    grupo: 'cuadernos',
    claro: { fondo: '#fbfaf7', acento: '#6a57b8', tinta: '#35323f' },
    oscuro: { fondo: '#14141d', acento: '#ab9cf0', tinta: '#eeecf6' },
  },
  menta: {
    nombre: 'Menta granizada',
    grupo: 'cuadernos',
    claro: { fondo: '#e4f2ea', acento: '#17795c', tinta: '#2a231d' },
    oscuro: { fondo: '#111a16', acento: '#5cc79d', tinta: '#ebf4ef' },
  },
  tinta: {
    nombre: 'Tinta china',
    grupo: 'cuadernos',
    claro: { fondo: '#f4f3ef', acento: '#2b2b2b', tinta: '#151515' },
    oscuro: { fondo: '#121212', acento: '#e8e6e0', tinta: '#f1f0ec' },
  },
  pizarra: {
    nombre: 'Pizarra',
    grupo: 'cuadernos',
    claro: { fondo: '#e8ecef', acento: '#2a5d8f', tinta: '#1c2630' },
    oscuro: { fondo: '#16221d', acento: '#8ec9ea', tinta: '#edf3ef' },
  },
  mostaza: {
    nombre: 'Mostaza y oliva',
    grupo: 'cuadernos',
    claro: { fondo: '#f6efd8', acento: '#8f5a00', tinta: '#2b2416' },
    oscuro: { fondo: '#1a1610', acento: '#f0b640', tinta: '#f5efe0' },
  },
  cacao: {
    nombre: 'Chocolate caliente',
    grupo: 'cuadernos',
    claro: { fondo: '#f3e9df', acento: '#6b3d1f', tinta: '#2a1d14' },
    oscuro: { fondo: '#171210', acento: '#d9a079', tinta: '#f4ebe3' },
  },
  hadas: {
    nombre: 'Jardín de hadas',
    grupo: 'hadas',
    claro: { fondo: '#eeeed6', acento: '#6c5596', tinta: '#24261a' },
    oscuro: { fondo: '#13170f', acento: '#b9a5e8', tinta: '#eef0de' },
  },
  pradera: {
    nombre: 'Pradera de luz',
    grupo: 'hadas',
    claro: { fondo: '#eff5e9', acento: '#b03f63', tinta: '#26301f' },
    oscuro: { fondo: '#121812', acento: '#f29bb6', tinta: '#eef5ea' },
  },
  acuarela: {
    nombre: 'Acuarela y estrellas',
    grupo: 'hadas',
    claro: { fondo: '#f1eadb', acento: '#4f6d3a', tinta: '#27241c' },
    oscuro: { fondo: '#171a14', acento: '#a4c98a', tinta: '#f1ecdf' },
  },
  dragon: {
    nombre: 'Guarida del dragón',
    grupo: 'hadas',
    claro: { fondo: '#f3e4cf', acento: '#b0406f', tinta: '#26211a' },
    oscuro: { fondo: '#1a1512', acento: '#f39ac0', tinta: '#f5ebdd' },
  },
  hongo: {
    nombre: 'Hada del hongo',
    grupo: 'hadas',
    claro: { fondo: '#f2ecf3', acento: '#7b4a8e', tinta: '#27212c' },
    oscuro: { fondo: '#16121a', acento: '#cfa3e0', tinta: '#f2ecf5' },
  },
  mariposas: {
    nombre: 'Vuelo de mariposas',
    grupo: 'hadas',
    claro: { fondo: '#edf2f8', acento: '#4a5bb0', tinta: '#1f2533' },
    oscuro: { fondo: '#11141c', acento: '#a3b1f2', tinta: '#edf1f8' },
  },
  campanitas: {
    nombre: 'Campanitas',
    grupo: 'hadas',
    claro: { fondo: '#e9f3f1', acento: '#23706b', tinta: '#1d2a28' },
    oscuro: { fondo: '#0f1817', acento: '#7fd1c6', tinta: '#eaf5f3' },
  },
  cine: {
    nombre: 'Sala de cine',
    grupo: 'salidas',
    claro: { fondo: '#f8f0e4', acento: '#b3202c', tinta: '#2a1a1b' },
    oscuro: { fondo: '#140d0e', acento: '#f26b76', tinta: '#f6ebe6' },
  },
  videoclub: {
    nombre: 'Videoclub',
    grupo: 'salidas',
    claro: { fondo: '#eef0f5', acento: '#c2187a', tinta: '#1e2030' },
    oscuro: { fondo: '#0f1119', acento: '#ff6fc0', tinta: '#eceef8' },
  },
  marea: {
    nombre: 'Marea',
    grupo: 'salidas',
    claro: { fondo: '#e5f1f5', acento: '#0b6f93', tinta: '#1b2a31' },
    oscuro: { fondo: '#0b161b', acento: '#67c8e6', tinta: '#e9f3f6' },
  },
  atardecer: {
    nombre: 'Atardecer',
    grupo: 'salidas',
    claro: { fondo: '#f9e9e0', acento: '#8b3a7e', tinta: '#2d1f2a' },
    oscuro: { fondo: '#1b1220', acento: '#e39ad8', tinta: '#f5ebf2' },
  },
  frutilla: {
    nombre: 'Frutilla y crema',
    grupo: 'salidas',
    claro: { fondo: '#fdeef0', acento: '#c62f66', tinta: '#2d1b20' },
    oscuro: { fondo: '#1a1014', acento: '#ff85ad', tinta: '#f8ecef' },
  },
  galaxia: {
    nombre: 'Galaxia',
    grupo: 'salidas',
    claro: { fondo: '#eceaf7', acento: '#6a35c9', tinta: '#1f1b33' },
    oscuro: { fondo: '#0c0a1a', acento: '#b89cff', tinta: '#eeecf8' },
  },
  pergamino: {
    nombre: 'Pergamino',
    grupo: 'medieval',
    claro: { fondo: '#efe2c2', acento: '#8c1c13', tinta: '#2c2013' },
    oscuro: { fondo: '#1b1510', acento: '#ec7a5e', tinta: '#efe3c8' },
  },
  castillo: {
    nombre: 'Castillo',
    grupo: 'medieval',
    claro: { fondo: '#dcdad3', acento: '#1f4e8c', tinta: '#1c1d22' },
    oscuro: { fondo: '#15171b', acento: '#8db4f0', tinta: '#ecebe6' },
  },
  vitral: {
    nombre: 'Vitral',
    grupo: 'medieval',
    claro: { fondo: '#f0e9dc', acento: '#a3153c', tinta: '#231a2a' },
    oscuro: { fondo: '#120d18', acento: '#ff7a9c', tinta: '#f3eaf5' },
  },
  taberna: {
    nombre: 'Taberna',
    grupo: 'medieval',
    claro: { fondo: '#e8d4b5', acento: '#84460f', tinta: '#1f1207' },
    oscuro: { fondo: '#1a120b', acento: '#e6a04a', tinta: '#f1e4d0' },
  },
  heraldica: {
    nombre: 'Heráldica',
    grupo: 'medieval',
    claro: { fondo: '#efe3cb', acento: '#a01818', tinta: '#2a1414' },
    oscuro: { fondo: '#170f0f', acento: '#ff7070', tinta: '#f5e9dc' },
  },
  druidas: {
    nombre: 'Bosque de druidas',
    grupo: 'medieval',
    claro: { fondo: '#dde5cc', acento: '#6e4a14', tinta: '#182214' },
    oscuro: { fondo: '#0f1510', acento: '#d3a657', tinta: '#e9efdf' },
  },
  alquimia: {
    nombre: 'Alquimia',
    grupo: 'medieval',
    claro: { fondo: '#e6e2ee', acento: '#7a5600', tinta: '#1c1830' },
    oscuro: { fondo: '#0e0b1c', acento: '#e6c15a', tinta: '#ece8f8' },
  },
};

export function temaValido(tema: string | null | undefined): Tema {
  return TEMAS.includes(tema as Tema) ? (tema as Tema) : 'papel';
}
