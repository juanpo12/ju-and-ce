import { T } from './textures/pixel';

export default /* css */ `
html[data-tema='ciudad'] {
  /* An 8-bit city at dusk: peach sky, a violet skyline and an orange pixel sun. */
  --fondo: #fde6dc;
  --superficie: #fff7f3;
  --superficie-alta: #ffffff;
  --tinta: #24122a;
  --tinta-suave: #5a3f5e;
  --acento: #8a2f8f;
  --sobre-acento: #ffffff;
  --acento-suave: #f3d4ec;
  --borde: #c99ab0;
  --estrella-vacia: #e6c6cf;
  --radio: 0;

  --durazno: #9a4008;
  --menta: #1f6a7a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-vt323), monospace;
  --tipo-cartel: var(--font-vt323), monospace;
  --titulo-peso: 400;
  --cartel-escala: 0.85;
  --borde-ancho: 2px;
  --sombra-baja: 3px 3px 0 rgb(138 47 143 / 0.35);
  --sombra-alta: 5px 5px 0 rgb(138 47 143 / 0.4);
  --titulo-sombra: 2px 2px 0 #f3d4ec;

  --textura:
    ${T['ciudad-skyline-light']},
    ${T['ciudad-block-light']},
    ${T['ciudad-moon-light']},
    ${T['ciudad-stars-light']};
  --textura-tamano: min(70vw, 300px) auto, min(36vw, 144px) auto, min(14vw, 52px) auto, 200px 200px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='ciudad'] {
  /* The same city at night: lit windows, a pixel moon and stars. */
  --fondo: #080b1c;
  --superficie: #11152e;
  --superficie-alta: #181d3a;
  --tinta: #eef0ff;
  --tinta-suave: #a9aed6;
  --acento: #ffd84a;
  --sobre-acento: #080b1c;
  --acento-suave: #2a2a1c;
  --borde: #2a3070;
  --estrella-vacia: #262a48;

  --durazno: #ff8fb1;
  --menta: #6ad8ff;
  --sobre-persona: #080b1c;

  --sombra-baja: 3px 3px 0 #000000;
  --sombra-alta: 5px 5px 0 #000000;
  --titulo-sombra: 0 0 8px rgb(255 216 74 / 0.45);

  --textura:
    ${T['ciudad-skyline-dark']},
    ${T['ciudad-block-dark']},
    ${T['ciudad-moon-dark']},
    ${T['ciudad-stars-dark']};
}
`;
