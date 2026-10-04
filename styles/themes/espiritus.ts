import { T } from './textures/anime';

export default /* css */ `
html[data-tema='espiritus'] {
  /* Deep forest: giant roots, little white spirits, soot sprites and fireflies. */
  --fondo: #e8f1e1;
  --superficie: #f8fbf4;
  --superficie-alta: #ffffff;
  --tinta: #1d2a1c;
  --tinta-suave: #4a5c47;
  --acento: #36702a;
  --sobre-acento: #ffffff;
  --acento-suave: #d6e8cc;
  --borde: #d2e2c8;
  --estrella-vacia: #bfd3b3;
  --radio: 1.5rem;

  --durazno: #8a5e0e;
  --menta: #2d6a7a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-coiny), sans-serif;
  --tipo-cartel: var(--font-coiny), sans-serif;
  --titulo-peso: 400;
  --cartel-escala: 0.5;

  --textura: ${T['espiritus-roots-light']}, ${T['espiritus-soot-light']}, ${T['espiritus-leaves-light']}, ${T['espiritus-fireflies-light']};
  --textura-tamano: min(72vw, 300px) auto, min(30vw, 120px) auto, min(40vw, 170px) auto, 260px 260px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left 8px bottom calc(var(--sobre-tab-bar) + 8px), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;

  --sombra-baja: 0 1px 2px rgb(30 60 25 / 0.06), 0 2px 6px rgb(30 60 25 / 0.05);
  --sombra-alta: 0 2px 4px rgb(30 60 25 / 0.06), 0 14px 32px -10px rgb(30 60 25 / 0.26);
}

html.dark[data-tema='espiritus'] {
  /* The forest at night, lit only by fireflies. */
  --fondo: #0f1810;
  --superficie: #172318;
  --superficie-alta: #1f2e20;
  --tinta: #ecf5e6;
  --tinta-suave: #a9bba3;
  --acento: #9fdc7c;
  --sobre-acento: #0f1810;
  --acento-suave: #24381f;
  --borde: #29392a;
  --estrella-vacia: #354836;

  --durazno: #f0c46c;
  --menta: #8fd0e0;
  --sobre-persona: #0f1810;

  --textura: ${T['espiritus-roots-dark']}, ${T['espiritus-soot-dark']}, ${T['espiritus-leaves-dark']}, ${T['espiritus-fireflies-dark']};
}
`;
