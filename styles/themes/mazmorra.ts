import { T } from './textures/pixel';

export default /* css */ `
html[data-tema='mazmorra'] {
  /* A dungeon wall: stone bricks, a burning torch, bones on the floor and a locked door. */
  --fondo: #e6e1d6;
  --superficie: #f6f3ec;
  --superficie-alta: #fffdf8;
  --tinta: #1c1814;
  --tinta-suave: #4a4238;
  --acento: #a63a12;
  --sobre-acento: #ffffff;
  --acento-suave: #f2d6c6;
  --borde: #6b6255;
  --estrella-vacia: #cfc6b4;
  --radio: 0;

  --durazno: #7a5200;
  --menta: #2f5f7a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-jacquard), serif;
  --tipo-cartel: var(--font-jacquard), serif;
  --titulo-peso: 400;
  --cartel-escala: 0.95;
  --cartel-mayusculas: none;
  --borde-ancho: 3px;
  --sombra-baja: 3px 3px 0 #3a332b;
  --sombra-alta: 5px 5px 0 #3a332b;

  --textura:
    ${T['mazmorra-door-light']},
    ${T['mazmorra-bones-light']},
    ${T['mazmorra-torch-light']},
    ${T['mazmorra-bricks-light']};
  --textura-tamano: min(24vw, 96px) auto, min(26vw, 96px) auto, min(14vw, 56px) auto, 64px 64px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='mazmorra'] {
  /* The same dungeon with only the torch for light. */
  --fondo: #121016;
  --superficie: #1c1920;
  --superficie-alta: #25212a;
  --tinta: #efe8dc;
  --tinta-suave: #b3a998;
  --acento: #ff8a3d;
  --sobre-acento: #121016;
  --acento-suave: #3a2418;
  --borde: #4a4250;
  --estrella-vacia: #3a3540;

  --durazno: #f2c040;
  --menta: #7ab8e0;
  --sobre-persona: #121016;

  --sombra-baja: 3px 3px 0 #000000;
  --sombra-alta: 5px 5px 0 #000000;
  --titulo-sombra: 0 0 10px rgb(255 138 61 / 0.55);

  --textura:
    ${T['mazmorra-door-dark']},
    ${T['mazmorra-bones-dark']},
    ${T['mazmorra-torch-dark']},
    ${T['mazmorra-bricks-dark']};
}
`;
