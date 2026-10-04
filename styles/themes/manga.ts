import { T } from './textures/anime';

export default /* css */ `
html[data-tema='manga'] {
  /* A printed manga page: screentone, square panels, red sound effects. */
  --fondo: #f4f4f2;
  --superficie: #ffffff;
  --superficie-alta: #ffffff;
  --tinta: #111111;
  --tinta-suave: #4a4a4a;
  --acento: #b80f2a;
  --sobre-acento: #ffffff;
  --acento-suave: #f1d6da;
  --borde: #111111;
  --estrella-vacia: #c9c9c9;
  --radio: 0;

  --durazno: #1f4fa3;
  --menta: #2f6a50;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-bangers), Impact, sans-serif;
  --tipo-cartel: var(--font-bangers), Impact, sans-serif;
  --titulo-peso: 400;
  --titulo-espaciado: 0.04em;
  --cartel-escala: 0.95;
  --borde-ancho: 3px;

  --textura: ${T['manga-panel-light']}, ${T['manga-bubble-light']}, ${T['manga-sfx-light']}, ${T['manga-tone-light']};
  --textura-tamano: min(50vw, 210px) auto, min(30vw, 125px) auto, min(30vw, 130px) auto, 10px 10px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;

  --sombra-baja: 3px 3px 0 #111111;
  --sombra-alta: 6px 6px 0 #111111;
}

html.dark[data-tema='manga'] {
  /* The same page with the ink inverted. */
  --fondo: #0d0d0d;
  --superficie: #181818;
  --superficie-alta: #222222;
  --tinta: #f5f5f5;
  --tinta-suave: #b5b5b5;
  --acento: #ff5a6e;
  --sobre-acento: #0d0d0d;
  --acento-suave: #3a1a20;
  --borde: #f5f5f5;
  --estrella-vacia: #3d3d3d;

  --durazno: #f0c46c;
  --menta: #8ed1b0;
  --sobre-persona: #0d0d0d;

  --textura: ${T['manga-panel-dark']}, ${T['manga-bubble-dark']}, ${T['manga-sfx-dark']}, ${T['manga-tone-dark']};
  --sombra-baja: 3px 3px 0 #f5f5f5;
  --sombra-alta: 6px 6px 0 #f5f5f5;
}
`;
