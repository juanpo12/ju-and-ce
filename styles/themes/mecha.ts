import { T } from './textures/anime';

export default /* css */ `
html[data-tema='mecha'] {
  /* The hangar: armor plates, hazard stripes and a giant robot peeking in. */
  --fondo: #e6e8ea;
  --superficie: #f7f8f9;
  --superficie-alta: #ffffff;
  --tinta: #15181c;
  --tinta-suave: #474e57;
  --acento: #c4302b;
  --sobre-acento: #ffffff;
  --acento-suave: #f4d5d3;
  --borde: #b9bec5;
  --estrella-vacia: #c3c8ce;
  --radio: 0.2rem;

  --durazno: #1d5fb8;
  --menta: #2f6e3c;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-chakra), var(--font-orbitron), sans-serif;
  --tipo-cartel: var(--font-chakra), sans-serif;
  --titulo-peso: 700;
  --titulo-mayusculas: uppercase;
  --titulo-espaciado: 0.06em;
  --cartel-escala: 0.6;
  --borde-ancho: 2px;
  --titulo-sombra: 2px 2px 0 #f5b800;

  --textura: ${T['mecha-head-light']}, ${T['mecha-hazard-light']}, ${T['mecha-plates-light']};
  --textura-tamano: min(64vw, 270px) auto, min(34vw, 140px) auto, 160px 160px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), 0 0;
  --textura-repetir: no-repeat, no-repeat, repeat;

  --sombra-baja: 0 1px 0 #b9bec5, 0 2px 4px rgb(21 24 28 / 0.08);
  --sombra-alta: 4px 4px 0 #15181c;
}

html.dark[data-tema='mecha'] {
  /* Night shift in the hangar: dark armor, visor glowing cyan. */
  --fondo: #0e1114;
  --superficie: #171b20;
  --superficie-alta: #20252b;
  --tinta: #eef1f4;
  --tinta-suave: #a8b0ba;
  --acento: #ff6b5e;
  --sobre-acento: #0e1114;
  --acento-suave: #3a1d1b;
  --borde: #2c333b;
  --estrella-vacia: #3a424c;

  --durazno: #7fb2ff;
  --menta: #8fdc9a;
  --sobre-persona: #0e1114;

  --titulo-sombra: 2px 2px 0 #7a5c00;
  --textura: ${T['mecha-head-dark']}, ${T['mecha-hazard-dark']}, ${T['mecha-plates-dark']};
  --sombra-alta: 4px 4px 0 #f5b800;
}
`;
