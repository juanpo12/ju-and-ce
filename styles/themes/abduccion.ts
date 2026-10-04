import { T } from './textures/espacio';

export default /* css */ `
html[data-tema='abduccion'] {
  /* The silly one: a saucer beaming a cow up over a farm in broad daylight,
     a red barn and crop circles stamped in the background. */
  --fondo: #e2eef5;
  --superficie: #f9fcfe;
  --superficie-alta: #ffffff;
  --tinta: #14202a;
  --tinta-suave: #445564;
  --acento: #3d7a12;
  --sobre-acento: #ffffff;
  --acento-suave: #dcefc8;
  --borde: #c3d3de;
  --estrella-vacia: #bccbd6;
  --radio: 1rem;

  --durazno: #a1301f;
  --menta: #6a3fa0;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-lilita), sans-serif;
  --tipo-cartel: var(--font-bungee), sans-serif;
  --titulo-peso: 400;
  --titulo-espaciado: 0.02em;
  --cartel-escala: 0.55;
  --titulo-sombra: 2px 2px 0 #c9e3a8;
  --borde-ancho: 2px;
  --sombra-baja: 3px 3px 0 rgb(20 32 42 / 0.16);
  --sombra-alta: 5px 5px 0 rgb(20 32 42 / 0.18);

  --textura:
    ${T['abduccion-cow-light']},
    ${T['abduccion-barn-light']},
    ${T['abduccion-moon-light']},
    ${T['abduccion-pattern-light']};
  --textura-tamano: min(54vw, 230px) auto, min(46vw, 190px) auto, min(24vw, 100px) auto, 240px 240px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right 6px top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='abduccion'] {
  /* The same farm at night, which is when this usually happens. */
  --fondo: #0d1a2b;
  --superficie: #142438;
  --superficie-alta: #1b2e45;
  --tinta: #eef5ff;
  --tinta-suave: #a9bbd0;
  --acento: #c9ff6a;
  --sobre-acento: #0d1a2b;
  --acento-suave: #2a3d1d;
  --borde: #24384f;
  --estrella-vacia: #2e4560;

  --durazno: #ff8f7a;
  --menta: #c7a6ff;
  --sobre-persona: #0d1a2b;

  --titulo-sombra: 0 0 12px rgb(201 255 106 / 0.45);
  --sombra-baja: 3px 3px 0 rgb(0 0 0 / 0.35);
  --sombra-alta: 5px 5px 0 rgb(0 0 0 / 0.4);

  --textura:
    ${T['abduccion-cow-dark']},
    ${T['abduccion-barn-dark']},
    ${T['abduccion-moon-dark']},
    ${T['abduccion-pattern-dark']};
}
`;
