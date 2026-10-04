import { T } from './textures/pixel';

export default /* css */ `
html[data-tema='bloques'] {
  /* A block world: grass and dirt cubes, ore in the stone, a square tree and a square sun. */
  --fondo: #e3eef8;
  --superficie: #f7fbff;
  --superficie-alta: #ffffff;
  --tinta: #141a20;
  --tinta-suave: #3e4a55;
  --acento: #2f7a1c;
  --sobre-acento: #ffffff;
  --acento-suave: #d8ecd0;
  --borde: #5a3b22;
  --estrella-vacia: #c2cfdb;
  --radio: 0;

  --durazno: #8a4a12;
  --menta: #0e6e7a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-silkscreen), monospace;
  --tipo-cartel: var(--font-silkscreen), monospace;
  --titulo-peso: 400;
  --titulo-espaciado: -0.04em;
  --cartel-escala: 0.5;
  --borde-ancho: 3px;
  --sombra-baja: 3px 3px 0 rgb(20 26 32 / 0.35);
  --sombra-alta: 6px 6px 0 rgb(20 26 32 / 0.35);
  --titulo-sombra: 3px 3px 0 #c2cfdb;

  --textura:
    ${T['bloques-hill-light']},
    ${T['bloques-ores-light']},
    ${T['bloques-sun-light']},
    ${T['bloques-specks-light']};
  --textura-tamano: min(36vw, 160px) auto, min(22vw, 96px) auto, min(11vw, 42px) auto, 120px 120px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='bloques'] {
  /* Underground: stone, glowing ore and a square moon. */
  --fondo: #0f1216;
  --superficie: #181c22;
  --superficie-alta: #20252c;
  --tinta: #eef2f6;
  --tinta-suave: #a9b2bc;
  --acento: #6ad44a;
  --sobre-acento: #0f1216;
  --acento-suave: #1f3318;
  --borde: #4a4a52;
  --estrella-vacia: #30343c;

  --durazno: #f0a050;
  --menta: #4ad6d0;
  --sobre-persona: #0f1216;

  --sombra-baja: 3px 3px 0 #000000;
  --sombra-alta: 6px 6px 0 #000000;
  --titulo-sombra: 3px 3px 0 #30343c;

  --textura:
    ${T['bloques-hill-dark']},
    ${T['bloques-ores-dark']},
    ${T['bloques-sun-dark']},
    ${T['bloques-specks-dark']};
}
`;
