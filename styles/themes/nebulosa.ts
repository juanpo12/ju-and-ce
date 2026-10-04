import { T } from './textures/espacio';

export default /* css */ `
html[data-tema='nebulosa'] {
  /* Deep space in pastel: pink, violet and teal gas clouds, a ringed planet
     and a dense starfield. Unlike galaxia, the color is in the clouds. */
  --fondo: #f1eaf8;
  --superficie: #fdfbff;
  --superficie-alta: #ffffff;
  --tinta: #1d1430;
  --tinta-suave: #554a6e;
  --acento: #b0218a;
  --sobre-acento: #ffffff;
  --acento-suave: #f5d6ec;
  --borde: #e2d6f0;
  --estrella-vacia: #d3c5e6;
  --radio: 1.5rem;

  --durazno: #2d63a8;
  --menta: #0f7a72;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-audiowide), sans-serif;
  --tipo-cartel: var(--font-monoton), sans-serif;
  --titulo-peso: 400;
  --cartel-escala: 0.48;
  --titulo-sombra: 0 0 14px rgb(240 120 210 / 0.55);
  --sombra-baja: 0 0 0 1px var(--acento-suave), 0 4px 14px -8px rgb(176 33 138 / 0.3);
  --sombra-alta: 0 0 0 1px var(--acento-suave), 0 12px 32px -10px rgb(176 33 138 / 0.38);

  --textura:
    ${T['nebulosa-planet-light']},
    ${T['nebulosa-cloud2-light']},
    ${T['nebulosa-cloud-light']},
    ${T['nebulosa-pattern-light']};
  --textura-tamano: min(54vw, 230px) auto, min(46vw, 190px) auto, min(52vw, 230px) auto, 240px 240px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='nebulosa'] {
  /* The real thing: near-black space and neon gas. */
  --fondo: #0a0716;
  --superficie: #140f26;
  --superficie-alta: #1c1633;
  --tinta: #f4eeff;
  --tinta-suave: #b3a7d6;
  --acento: #ff6ad5;
  --sobre-acento: #0a0716;
  --acento-suave: #3a1840;
  --borde: #2a2147;
  --estrella-vacia: #3a2f5e;

  --durazno: #ffc96b;
  --menta: #4ef0e0;
  --sobre-persona: #0a0716;

  --titulo-sombra: 0 0 6px rgb(255 106 213 / 0.9), 0 0 20px rgb(255 106 213 / 0.55);
  --sombra-baja: 0 0 0 1px #2a2147, 0 0 16px -6px rgb(255 106 213 / 0.35);
  --sombra-alta: 0 0 0 1px #3a1840, 0 0 32px -6px rgb(255 106 213 / 0.5);

  --textura:
    ${T['nebulosa-planet-dark']},
    ${T['nebulosa-cloud2-dark']},
    ${T['nebulosa-cloud-dark']},
    ${T['nebulosa-pattern-dark']};
}
`;
