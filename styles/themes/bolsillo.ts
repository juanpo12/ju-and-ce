import { T } from './textures/pixel';

export default /* css */ `
html[data-tema='bolsillo'] {
  /* A four-shade handheld screen: pea green, a dot-matrix grid and a tiny hero. */
  --fondo: #d3e2a8;
  --superficie: #e4eec4;
  --superficie-alta: #eef5d6;
  --tinta: #0b1f0b;
  --tinta-suave: #2e4a22;
  --acento: #306230;
  --sobre-acento: #e4eec4;
  --acento-suave: #b9cc8a;
  --borde: #0f380f;
  --estrella-vacia: #a9bf7c;
  --radio: 0;

  --durazno: #5c4a00;
  --menta: #1d4a5a;
  --sobre-persona: #e4eec4;

  --tipo-titulo: var(--font-vt323), monospace;
  --tipo-cartel: var(--font-silkscreen), monospace;
  --titulo-peso: 400;
  --titulo-mayusculas: uppercase;
  --cartel-escala: 0.5;
  --borde-ancho: 3px;
  --sombra-baja: 3px 3px 0 #306230;
  --sombra-alta: 5px 5px 0 #0f380f;

  --textura:
    ${T['bolsillo-hero-light']},
    ${T['bolsillo-slime-light']},
    ${T['bolsillo-hearts-light']},
    ${T['bolsillo-grid-light']};
  --textura-tamano: min(32vw, 140px) auto, min(22vw, 96px) auto, min(28vw, 124px) auto, 4px 4px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='bolsillo'] {
  /* The same screen with the palette inverted, like the backlight is off. */
  --fondo: #0b170b;
  --superficie: #142612;
  --superficie-alta: #1c3219;
  --tinta: #e0f0b8;
  --tinta-suave: #a8c27a;
  --acento: #9bbc0f;
  --sobre-acento: #0b170b;
  --acento-suave: #24401c;
  --borde: #6a9a2a;
  --estrella-vacia: #2e4a22;

  --durazno: #e8c85a;
  --menta: #7ad6c8;
  --sobre-persona: #0b170b;

  --sombra-baja: 3px 3px 0 #306230;
  --sombra-alta: 5px 5px 0 #000000;

  --textura:
    ${T['bolsillo-hero-dark']},
    ${T['bolsillo-slime-dark']},
    ${T['bolsillo-hearts-dark']},
    ${T['bolsillo-grid-dark']};
}
`;
