import { T } from './textures/sorpresas';

export default /* css */ `
html[data-tema='brujas'] {
  /* Halloween at dusk: jack-o'-lanterns, a tombstone, a web with its spider. */
  --fondo: #fbeedd;
  --superficie: #fffaf3;
  --superficie-alta: #ffffff;
  --tinta: #22122c;
  --tinta-suave: #574463;
  --acento: #b23a0a;
  --sobre-acento: #ffffff;
  --acento-suave: #f6d6c2;
  --borde: #ecd5bd;
  --estrella-vacia: #e0c6ab;
  --radio: 0.6rem;

  --durazno: #6b2fa0;
  --menta: #2f6a1a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-creepster), cursive;
  --tipo-cartel: var(--font-lilita), sans-serif;
  --titulo-peso: 400;
  --titulo-espaciado: 0.04em;
  --cartel-escala: 0.72;
  --borde-ancho: 2px;
  --titulo-sombra: 2px 2px 0 #f7b267;
  --sombra-baja: 0 1px 2px rgb(60 20 70 / 0.08), 0 2px 6px rgb(60 20 70 / 0.06);
  --sombra-alta: 0 2px 4px rgb(60 20 70 / 0.08), 0 14px 32px -10px rgb(60 20 70 / 0.3);

  --textura: ${T['brujas-rb-light']}, ${T['brujas-lb-light']}, ${T['brujas-rt-light']}, ${T['brujas-pattern-light']};
  --textura-tamano: min(58vw, 250px) auto, min(34vw, 150px) auto, min(42vw, 180px) auto, 220px 220px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='brujas'] {
  /* Midnight: the pumpkins glow and the moon is full. */
  --fondo: #140b1f;
  --superficie: #1f1430;
  --superficie-alta: #2a1c40;
  --tinta: #f6ecff;
  --tinta-suave: #c3b2d6;
  --acento: #ff8a2a;
  --sobre-acento: #140b1f;
  --acento-suave: #3d2320;
  --borde: #33244a;
  --estrella-vacia: #43325c;

  --durazno: #c79bff;
  --menta: #9fe05a;
  --sobre-persona: #140b1f;

  --titulo-sombra: 0 0 10px rgb(255 138 42 / 0.55);

  --textura: ${T['brujas-rb-dark']}, ${T['brujas-lb-dark']}, ${T['brujas-rt-dark']}, ${T['brujas-pattern-dark']};
}
`;
