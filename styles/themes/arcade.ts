import { T } from './textures/pixel';

export default /* css */ `
html[data-tema='arcade'] {
  /* Cabinet side art: cream and hot magenta, invaders marching in from the corners. */
  --fondo: #fff4cc;
  --superficie: #fffbea;
  --superficie-alta: #ffffff;
  --tinta: #1a0f24;
  --tinta-suave: #4f3f5c;
  --acento: #b0126c;
  --sobre-acento: #ffffff;
  --acento-suave: #fbd3e6;
  --borde: #3a2450;
  --estrella-vacia: #e6d3b0;
  --radio: 0;

  --durazno: #a14a00;
  --menta: #1f5fbf;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-pixelify), monospace;
  --tipo-cartel: var(--font-press-start), monospace;
  --titulo-peso: 700;
  --titulo-mayusculas: uppercase;
  --titulo-espaciado: 0.02em;
  --cartel-escala: 0.34;
  --borde-ancho: 3px;
  --sombra-baja: 3px 3px 0 #3a2450;
  --sombra-alta: 6px 6px 0 #3a2450;
  --titulo-sombra: 3px 3px 0 #f5a400;
  /* CRT scanlines, barely there. */
  --tarjeta-textura: repeating-linear-gradient(to bottom, transparent 0 3px, rgb(58 36 80 / 0.035) 3px 4px);

  --textura:
    ${T['arcade-ship-light']},
    ${T['arcade-army-light']},
    ${T['arcade-saucer-light']},
    ${T['arcade-stars-light']};
  --textura-tamano: min(60vw, 256px) auto, min(30vw, 132px) auto, min(22vw, 100px) auto, 160px 160px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='arcade'] {
  /* Inside the arcade at night: neon on black, cyan outlines, a glow on every title. */
  --fondo: #0a0612;
  --superficie: #150d22;
  --superficie-alta: #1e1430;
  --tinta: #f5ecff;
  --tinta-suave: #c0b0d6;
  --acento: #ff4fd8;
  --sobre-acento: #0a0612;
  --acento-suave: #3a1440;
  --borde: #3df5ff;
  --estrella-vacia: #3a2d4a;

  --durazno: #ffd23f;
  --menta: #3dff8f;
  --sobre-persona: #0a0612;

  --sombra-baja: 0 0 0 1px #3df5ff, 0 0 10px rgb(61 245 255 / 0.25);
  --sombra-alta: 0 0 0 1px #3df5ff, 0 0 22px rgb(61 245 255 / 0.4);
  --titulo-sombra: 0 0 2px #ff4fd8, 0 0 10px #ff4fd8;
  --tarjeta-textura: repeating-linear-gradient(to bottom, transparent 0 3px, rgb(255 255 255 / 0.03) 3px 4px);

  --textura:
    ${T['arcade-ship-dark']},
    ${T['arcade-army-dark']},
    ${T['arcade-saucer-dark']},
    ${T['arcade-stars-dark']};
}
`;
