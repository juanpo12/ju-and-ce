import { T } from './textures/dragones';

export default /* css */ `
html[data-tema='fuego'] {
  /* Volcanic ash and embers: a black dragon head breathing over the corner, flames licking up from the other side. */
  --fondo: #efe2d6;
  --superficie: #fbf3ec;
  --superficie-alta: #ffffff;
  --tinta: #1f0e0a;
  --tinta-suave: #5a3a30;
  --acento: #b3261a;
  --sobre-acento: #ffffff;
  --acento-suave: #f5d3c8;
  --borde: #3a1410;
  --estrella-vacia: #d8bfae;
  --radio: 0.25rem;

  --durazno: #8a5a00;
  --menta: #2f5f7a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-new-rocker), Georgia, serif;
  --tipo-cartel: var(--font-new-rocker), Georgia, serif;
  --titulo-peso: 400;
  --cartel-escala: 0.6;
  --borde-ancho: 2px;
  --titulo-espaciado: 0.02em;
  --sombra-baja: 3px 3px 0 var(--borde);
  --sombra-alta: 5px 5px 0 var(--borde);
  --titulo-sombra: 2px 2px 0 rgb(242 140 40 / 0.55);

  --textura:
    ${T['fuego-head-light']},
    ${T['fuego-flames-light']},
    ${T['fuego-embers-light']};
  --textura-tamano: min(60vw, 260px) auto, min(40vw, 170px) auto, 200px 200px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), 0 0;
  --textura-repetir: no-repeat, no-repeat, repeat;
}

html.dark[data-tema='fuego'] {
  /* The same dragon at night: the lava glows and the ash turns to sparks. */
  --fondo: #140806;
  --superficie: #22100c;
  --superficie-alta: #2c1610;
  --tinta: #f7e6d8;
  --tinta-suave: #c9a796;
  --acento: #ff7b4a;
  --sobre-acento: #140806;
  --acento-suave: #4a1d12;
  --borde: #5a2418;
  --estrella-vacia: #4a2a20;

  --durazno: #f2c14e;
  --menta: #7fc3e0;
  --sobre-persona: #140806;

  --sombra-baja: 3px 3px 0 #000000;
  --sombra-alta: 0 0 0 1px var(--borde), 0 14px 34px -10px rgb(255 90 30 / 0.4);
  --titulo-sombra: 0 0 14px rgb(255 120 40 / 0.65);
  --textura:
    ${T['fuego-head-dark']},
    ${T['fuego-flames-dark']},
    ${T['fuego-embers-dark']};
}
`;
