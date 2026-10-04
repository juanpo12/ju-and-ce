import { T } from './textures/pixel';

export default /* css */ `
html[data-tema='aventura'] {
  /* A 16-bit overworld: grass tiles, a forest, a dirt path and a chest to open. Cards are RPG dialog boxes. */
  --fondo: #eaf4d4;
  --superficie: #fbfdf3;
  --superficie-alta: #ffffff;
  --tinta: #142010;
  --tinta-suave: #3e5236;
  --acento: #1f5fc4;
  --sobre-acento: #ffffff;
  --acento-suave: #d6e4fa;
  --borde: #2a4a8a;
  --estrella-vacia: #c9d6b4;
  --radio: 4px;

  --durazno: #9a4a12;
  --menta: #2a7a3a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-pixelify), monospace;
  --tipo-cartel: var(--font-pixelify), monospace;
  --titulo-peso: 700;
  --cartel-escala: 0.6;
  /* The double frame of a classic RPG text window. */
  --borde-ancho: 4px;
  --borde-estilo: double;
  --sombra-baja: 3px 3px 0 rgb(20 32 16 / 0.25);
  --sombra-alta: 5px 5px 0 rgb(20 32 16 / 0.3);
  --titulo-sombra: 2px 2px 0 #c9d6b4;

  --textura:
    ${T['aventura-woods-light']},
    ${T['aventura-path-light']},
    ${T['aventura-tree-light']},
    ${T['aventura-grass-light']};
  --textura-tamano: min(46vw, 176px) auto, min(26vw, 96px) auto, min(16vw, 64px) auto, 128px 128px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='aventura'] {
  /* The same map at night, with the dialog boxes lit in moon blue. */
  --fondo: #0c160e;
  --superficie: #142218;
  --superficie-alta: #1b2c20;
  --tinta: #eaf4dc;
  --tinta-suave: #a8bea0;
  --acento: #8ab4ff;
  --sobre-acento: #0c160e;
  --acento-suave: #1c2a48;
  --borde: #8ab4ff;
  --estrella-vacia: #2c3a30;

  --durazno: #f0b060;
  --menta: #8ee08a;
  --sobre-persona: #0c160e;

  --sombra-baja: 3px 3px 0 rgb(0 0 0 / 0.5);
  --sombra-alta: 5px 5px 0 rgb(0 0 0 / 0.6);
  --titulo-sombra: 2px 2px 0 #1c2a48;

  --textura:
    ${T['aventura-woods-dark']},
    ${T['aventura-path-dark']},
    ${T['aventura-tree-dark']},
    ${T['aventura-grass-dark']};
}
`;
