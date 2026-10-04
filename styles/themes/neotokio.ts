import { T } from './textures/anime';

export default /* css */ `
html[data-tema='neotokio'] {
  /* Cyberpunk city at dusk: towers, neon signs and slanted rain. */
  --fondo: #efe9f7;
  --superficie: #fbf9fe;
  --superficie-alta: #ffffff;
  --tinta: #1a1530;
  --tinta-suave: #4f4868;
  --acento: #c0187a;
  --sobre-acento: #ffffff;
  --acento-suave: #f5d3e8;
  --borde: #ddd3ee;
  --estrella-vacia: #cfc4e2;
  --radio: 0.5rem;

  --durazno: #0d6f8a;
  --menta: #2f6e4a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-audiowide), sans-serif;
  --tipo-cartel: var(--font-audiowide), sans-serif;
  --titulo-peso: 400;
  --cartel-escala: 0.46;
  --titulo-sombra: 2px 2px 0 rgb(47 211 255 / 0.55);

  --textura: ${T['neotokio-city-light']}, ${T['neotokio-sign-light']}, ${T['neotokio-rain-light']};
  --textura-tamano: min(72vw, 300px) auto, min(26vw, 110px) auto, 200px 200px;
  --textura-posicion: right bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, repeat;

  --sombra-baja: 0 1px 2px rgb(40 20 80 / 0.07), 0 2px 6px rgb(40 20 80 / 0.06);
  --sombra-alta: 0 0 0 1px rgb(192 24 122 / 0.25), 0 14px 32px -10px rgb(40 20 80 / 0.3);
}

html.dark[data-tema='neotokio'] {
  /* Midnight: wet streets and neon everywhere. */
  --fondo: #0a0814;
  --superficie: #141026;
  --superficie-alta: #1c1733;
  --tinta: #f2eeff;
  --tinta-suave: #ada6c9;
  --acento: #ff4fae;
  --sobre-acento: #0a0814;
  --acento-suave: #3b1636;
  --borde: #2a2348;
  --estrella-vacia: #383059;

  --durazno: #4fe0ff;
  --menta: #b7f56a;
  --sobre-persona: #0a0814;

  --titulo-sombra: 0 0 6px #ff4fae, 0 0 18px rgb(255 79 174 / 0.6);
  --textura: ${T['neotokio-city-dark']}, ${T['neotokio-sign-dark']}, ${T['neotokio-rain-dark']};
  --sombra-alta: 0 0 0 1px rgb(79 224 255 / 0.35), 0 0 24px -6px rgb(255 79 174 / 0.45);
}
`;
