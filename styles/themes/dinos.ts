import { T } from './textures/sorpresas';

export default /* css */ `
html[data-tema='dinos'] {
  /* Jurassic clearing: a T-rex by the volcano, a long-neck, ferns, footprints. */
  --fondo: #edf1dc;
  --superficie: #fbfcf3;
  --superficie-alta: #ffffff;
  --tinta: #1b2414;
  --tinta-suave: #485640;
  --acento: #2e6a26;
  --sobre-acento: #ffffff;
  --acento-suave: #d9e8c9;
  --borde: #d3dfbf;
  --estrella-vacia: #c8d4b2;
  --radio: 1rem;

  --durazno: #8a4a00;
  --menta: #155f6e;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-lilita), sans-serif;
  --tipo-cartel: var(--font-lilita), sans-serif;
  --titulo-peso: 400;
  --titulo-espaciado: 0.02em;
  --cartel-escala: 0.72;
  --borde-ancho: 2px;
  --sombra-baja: 0 3px 0 #cbd8b4;
  --sombra-alta: 0 5px 0 #cbd8b4, 0 16px 30px -14px rgb(40 60 20 / 0.35);

  --textura: ${T['dinos-rb-light']}, ${T['dinos-lb-light']}, ${T['dinos-rt-light']}, ${T['dinos-pattern-light']};
  --textura-tamano: min(64vw, 290px) auto, min(42vw, 190px) auto, min(34vw, 150px) auto, 200px 170px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='dinos'] {
  /* Night in the jungle: dark leaves and the volcano's glow. */
  --fondo: #10160e;
  --superficie: #182116;
  --superficie-alta: #212c1e;
  --tinta: #eef3e3;
  --tinta-suave: #afbca1;
  --acento: #93d46c;
  --sobre-acento: #10160e;
  --acento-suave: #26381f;
  --borde: #2a3824;
  --estrella-vacia: #364632;

  --durazno: #f2b14a;
  --menta: #6fd0c8;
  --sobre-persona: #10160e;

  --sombra-baja: 0 3px 0 #0a0e09;
  --sombra-alta: 0 5px 0 #0a0e09, 0 16px 30px -14px rgb(0 0 0 / 0.7);

  --textura: ${T['dinos-rb-dark']}, ${T['dinos-lb-dark']}, ${T['dinos-rt-dark']}, ${T['dinos-pattern-dark']};
}
`;
