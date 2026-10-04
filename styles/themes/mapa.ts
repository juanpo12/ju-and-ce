import { T } from './textures/dragones';

export default /* css */ `
html[data-tema='mapa'] {
  /* The kingdom map: sepia ink on parchment, a compass rose, a dotted road to the castle and a sea serpent where the map ends. */
  --fondo: #ecdcb6;
  --superficie: #f8efd9;
  --superficie-alta: #fdf8ea;
  --tinta: #2a1c0e;
  --tinta-suave: #5a4228;
  --acento: #9c2b1c;
  --sobre-acento: #ffffff;
  --acento-suave: #f0d3c4;
  --borde: #5a3d22;
  --estrella-vacia: #d3bf94;
  --radio: 2px;

  --durazno: #7a5600;
  --menta: #2c5f6b;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-almendra), Georgia, serif;
  --tipo-cartel: var(--font-almendra), Georgia, serif;
  --titulo-peso: 700;
  --cartel-escala: 0.66;
  --tipo-cita: var(--font-fell), Georgia, serif;
  --borde-ancho: 2px;
  --borde-estilo: dashed;
  --sombra-baja: 0 1px 2px rgb(90 61 34 / 0.15);
  --sombra-alta: 0 2px 4px rgb(90 61 34 / 0.12), 0 14px 30px -12px rgb(90 61 34 / 0.35);

  --textura:
    ${T['mapa-rose-light']},
    ${T['mapa-serpent-light']},
    ${T['mapa-land-light']},
    ${T['mapa-grid-light']};
  --textura-tamano: min(26vw, 110px) auto, min(52vw, 230px) auto, min(46vw, 220px) auto, 220px 220px;
  --textura-posicion: right top var(--bajo-cabecera), left bottom var(--sobre-tab-bar), right bottom var(--sobre-tab-bar), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='mapa'] {
  /* The same map read by candlelight. */
  --fondo: #1a140c;
  --superficie: #251c12;
  --superficie-alta: #2e2418;
  --tinta: #f2e4c6;
  --tinta-suave: #c2a983;
  --acento: #e0705a;
  --sobre-acento: #1a140c;
  --acento-suave: #4a2418;
  --borde: #6b5434;
  --estrella-vacia: #3d3020;

  --durazno: #e8c25a;
  --menta: #7cc4cf;
  --sobre-persona: #1a140c;

  --textura:
    ${T['mapa-rose-dark']},
    ${T['mapa-serpent-dark']},
    ${T['mapa-land-dark']},
    ${T['mapa-grid-dark']};
}
`;
