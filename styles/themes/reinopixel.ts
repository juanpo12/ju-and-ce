import { T } from './textures/pixel';

export default /* css */ `
html[data-tema='reinopixel'] {
  /* A pixel kingdom: a castle with flags, a dragon breathing fire over it and a knight on the hill. */
  --fondo: #eceffb;
  --superficie: #fafbff;
  --superficie-alta: #ffffff;
  --tinta: #16142a;
  --tinta-suave: #45425e;
  --acento: #6a3fc0;
  --sobre-acento: #ffffff;
  --acento-suave: #e2d8f7;
  --borde: #4a4458;
  --estrella-vacia: #c9c6dc;
  --radio: 2px;

  --durazno: #9a3a00;
  --menta: #23744a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-jacquard), serif;
  --tipo-cartel: var(--font-pixelify), monospace;
  --titulo-peso: 400;
  --cartel-escala: 0.6;
  --borde-ancho: 3px;
  --sombra-baja: 3px 3px 0 #4a4458;
  --sombra-alta: 5px 5px 0 #4a4458;
  --titulo-sombra: 2px 2px 0 #f2b51d;

  --textura:
    ${T['reinopixel-castle-light']},
    ${T['reinopixel-hill-light']},
    ${T['reinopixel-dragon-light']},
    ${T['reinopixel-sparkles-light']};
  --textura-tamano: min(56vw, 240px) auto, min(50vw, 200px) auto, min(34vw, 140px) auto, 180px 180px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='reinopixel'] {
  /* The kingdom at night, windows lit and the dragon still flying. */
  --fondo: #100c1c;
  --superficie: #1a1528;
  --superficie-alta: #221c34;
  --tinta: #f1ecff;
  --tinta-suave: #b4abd0;
  --acento: #b99cff;
  --sobre-acento: #100c1c;
  --acento-suave: #2e2448;
  --borde: #3a3552;
  --estrella-vacia: #2e2a42;

  --durazno: #ffb35a;
  --menta: #6ee0a0;
  --sobre-persona: #100c1c;

  --sombra-baja: 3px 3px 0 #000000;
  --sombra-alta: 5px 5px 0 #000000;
  --titulo-sombra: 2px 2px 0 #6a3fc0;

  --textura:
    ${T['reinopixel-castle-dark']},
    ${T['reinopixel-hill-dark']},
    ${T['reinopixel-dragon-dark']},
    ${T['reinopixel-sparkles-dark']};
}
`;
