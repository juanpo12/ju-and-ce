import { T } from './textures/sorpresas';

export default /* css */ `
html[data-tema='piratas'] {
  /* A treasure map at sea: the ship under full sail, the Jolly Roger, the chest. */
  --fondo: #efe1c3;
  --superficie: #fbf4e2;
  --superficie-alta: #fffaf0;
  --tinta: #1a1a26;
  --tinta-suave: #4c4636;
  --acento: #9b1b1b;
  --sobre-acento: #ffffff;
  --acento-suave: #f1d3c8;
  --borde: #cbb48a;
  --estrella-vacia: #d3bf96;
  --radio: 0.3rem;

  --durazno: #1e4a7a;
  --menta: #2d6a47;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-pirata), Georgia, serif;
  --tipo-cartel: var(--font-pirata), Georgia, serif;
  --titulo-peso: 400;
  --titulo-espaciado: 0.02em;
  --cartel-escala: 0.85;
  --borde-ancho: 3px;
  --borde-estilo: double;
  --sombra-baja: 2px 2px 0 #cdb88f;
  --sombra-alta: 4px 4px 0 #cdb88f;

  --textura: ${T['piratas-rb-light']}, ${T['piratas-lb-light']}, ${T['piratas-rt-light']}, ${T['piratas-pattern-light']};
  --textura-tamano: min(64vw, 290px) auto, min(38vw, 170px) auto, min(36vw, 160px) auto, 170px 160px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='piratas'] {
  /* Night watch on deck: navy sea, gold and lantern red. */
  --fondo: #0b1220;
  --superficie: #131d30;
  --superficie-alta: #1a263d;
  --tinta: #f2e7cf;
  --tinta-suave: #b8ad95;
  --acento: #ff6b5e;
  --sobre-acento: #0b1220;
  --acento-suave: #3a1e24;
  --borde: #2e3b56;
  --estrella-vacia: #2f3c56;

  --durazno: #e8c26a;
  --menta: #7fc7a8;
  --sobre-persona: #0b1220;

  --sombra-baja: 2px 2px 0 #05080f;
  --sombra-alta: 4px 4px 0 #05080f;

  --textura: ${T['piratas-rb-dark']}, ${T['piratas-lb-dark']}, ${T['piratas-rt-dark']}, ${T['piratas-pattern-dark']};
}
`;
