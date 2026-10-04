import { T } from './textures/dragones';

export default /* css */ `
html[data-tema='tesoro'] {
  /* The hoard: piles of gold, gems and a goblet, and the tail of the dragon sleeping on it. Amethyst and gold. */
  --fondo: #efe6f5;
  --superficie: #fbf7fd;
  --superficie-alta: #ffffff;
  --tinta: #1d1030;
  --tinta-suave: #4f3d66;
  --acento: #6a2a9c;
  --sobre-acento: #ffffff;
  --acento-suave: #e3d2f0;
  --borde: #c9a64a;
  --estrella-vacia: #d6c6e3;
  --radio: 0.375rem;

  --durazno: #8a5a00;
  --menta: #1f6e4a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-cinzel-deco), Georgia, serif;
  --tipo-cartel: var(--font-cinzel-deco), Georgia, serif;
  --titulo-peso: 700;
  --cartel-escala: 0.5;
  --borde-ancho: 2px;
  --sombra-baja: 3px 3px 0 var(--borde);
  --sombra-alta: 5px 5px 0 var(--borde);
  --titulo-sombra: 1px 1px 0 #e8b730;

  --textura:
    ${T['tesoro-hoard-light']},
    ${T['tesoro-tail-light']},
    ${T['tesoro-pattern-light']};
  --textura-tamano: min(62vw, 280px) auto, min(38vw, 170px) auto, 160px 160px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), 0 0;
  --textura-repetir: no-repeat, no-repeat, repeat;
}

html.dark[data-tema='tesoro'] {
  /* The treasure cave by torchlight: the gold is the only thing that shines. */
  --fondo: #150b22;
  --superficie: #1f1330;
  --superficie-alta: #281a3d;
  --tinta: #f6eedc;
  --tinta-suave: #c4b39a;
  --acento: #e8b730;
  --sobre-acento: #150b22;
  --acento-suave: #3d2a14;
  --borde: #6b4f1a;
  --estrella-vacia: #3a2a50;

  --durazno: #ff9c7a;
  --menta: #6fd6a8;
  --sobre-persona: #150b22;

  --sombra-baja: 3px 3px 0 var(--borde);
  --sombra-alta: 0 0 0 1px var(--borde), 0 14px 34px -10px rgb(232 183 48 / 0.3);
  --titulo-sombra: 0 0 12px rgb(232 183 48 / 0.55);
  --textura:
    ${T['tesoro-hoard-dark']},
    ${T['tesoro-tail-dark']},
    ${T['tesoro-pattern-dark']};
}
`;
