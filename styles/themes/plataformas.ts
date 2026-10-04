import { T } from './textures/pixel';

export default /* css */ `
html[data-tema='plataformas'] {
  /* A side-scrolling level: sky blue, puffy pixel clouds, brick stairs, coins and a green pipe. */
  --fondo: #c8e8ff;
  --superficie: #f4faff;
  --superficie-alta: #ffffff;
  --tinta: #0b1630;
  --tinta-suave: #34466a;
  --acento: #b8380f;
  --sobre-acento: #ffffff;
  --acento-suave: #fbd8cc;
  --borde: #0b1630;
  --estrella-vacia: #b8cde0;
  --radio: 0;

  --durazno: #8a5a00;
  --menta: #18773a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-pixelify), monospace;
  --tipo-cartel: var(--font-press-start), monospace;
  --titulo-peso: 700;
  --titulo-mayusculas: uppercase;
  --cartel-escala: 0.34;
  --borde-ancho: 3px;
  --sombra-baja: 3px 3px 0 #0b1630;
  --sombra-alta: 5px 5px 0 #0b1630;
  --titulo-sombra: 3px 3px 0 #ffffff;

  --textura:
    ${T['plataformas-pipe-light']},
    ${T['plataformas-stairs-light']},
    ${T['plataformas-blocks-light']},
    ${T['plataformas-clouds-light']};
  --textura-tamano: min(56vw, 232px) auto, min(24vw, 100px) auto, min(22vw, 90px) auto, 220px 140px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='plataformas'] {
  /* The night version of the level, with blue bricks. */
  --fondo: #0a0e26;
  --superficie: #141a3a;
  --superficie-alta: #1c2348;
  --tinta: #eef2ff;
  --tinta-suave: #aab4dc;
  --acento: #ff9a4a;
  --sobre-acento: #0a0e26;
  --acento-suave: #3a2418;
  --borde: #4a74e0;
  --estrella-vacia: #2a3358;

  --durazno: #ffd23f;
  --menta: #6ee08a;
  --sobre-persona: #0a0e26;

  --sombra-baja: 3px 3px 0 #000000;
  --sombra-alta: 5px 5px 0 #000000;
  --titulo-sombra: 3px 3px 0 #c8401a;

  --textura:
    ${T['plataformas-pipe-dark']},
    ${T['plataformas-stairs-dark']},
    ${T['plataformas-blocks-dark']},
    ${T['plataformas-clouds-dark']};
}
`;
