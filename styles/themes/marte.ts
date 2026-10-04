import { T } from './textures/espacio';

export default /* css */ `
html[data-tema='marte'] {
  /* Dusty orange Mars: dunes, a rover leaving tracks, rocks and craters, and
     both little moons up in the corner. */
  --fondo: #f2dcc6;
  --superficie: #fff6ee;
  --superficie-alta: #ffffff;
  --tinta: #2a140c;
  --tinta-suave: #5f3e30;
  --acento: #b23c14;
  --sobre-acento: #ffffff;
  --acento-suave: #f6d2c0;
  --borde: #e6c6ac;
  --estrella-vacia: #dbb89c;
  --radio: 0.5rem;

  --durazno: #2e5d8a;
  --menta: #2f6b4a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-audiowide), sans-serif;
  --tipo-cartel: var(--font-orbitron), sans-serif;
  --titulo-peso: 400;
  --titulo-espaciado: 0.02em;
  --cartel-escala: 0.5;
  --sombra-baja: 0 1px 2px rgb(90 40 20 / 0.08), 0 2px 6px rgb(90 40 20 / 0.06);
  --sombra-alta: 0 2px 4px rgb(90 40 20 / 0.08), 0 14px 32px -10px rgb(90 40 20 / 0.3);

  --textura:
    ${T['marte-rover-light']},
    ${T['marte-rocks-light']},
    ${T['marte-moons-light']},
    ${T['marte-pattern-light']};
  --textura-tamano: min(54vw, 220px) auto, min(38vw, 160px) auto, min(26vw, 110px) auto, 200px 200px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right 4px top calc(var(--bajo-cabecera) + 4px), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='marte'] {
  /* Martian night: rust-dark dunes under a sky with a few stars. */
  --fondo: #1a0d09;
  --superficie: #26130d;
  --superficie-alta: #311a12;
  --tinta: #fbe8dc;
  --tinta-suave: #c9a493;
  --acento: #ff8a5c;
  --sobre-acento: #1a0d09;
  --acento-suave: #4a2216;
  --borde: #3d2016;
  --estrella-vacia: #4d2a1e;

  --durazno: #8fc3ff;
  --menta: #8fe0b0;
  --sobre-persona: #1a0d09;

  --titulo-sombra: 0 0 14px rgb(255 138 92 / 0.35);

  --textura:
    ${T['marte-rover-dark']},
    ${T['marte-rocks-dark']},
    ${T['marte-moons-dark']},
    ${T['marte-pattern-dark']};
}
`;
