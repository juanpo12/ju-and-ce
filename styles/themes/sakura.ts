import { T } from './textures/anime';

export default /* css */ `
html[data-tema='sakura'] {
  /* Hanami in the afternoon: a blossoming branch, petals drifting over pink paper. */
  --fondo: #fbeef1;
  --superficie: #fffafb;
  --superficie-alta: #ffffff;
  --tinta: #2e1f26;
  --tinta-suave: #634b57;
  --acento: #b8336a;
  --sobre-acento: #ffffff;
  --acento-suave: #f8d9e4;
  --borde: #f1d4de;
  --estrella-vacia: #e5c3cf;
  --radio: 1.25rem;

  --durazno: #8a5e0e;
  --menta: #2f6e57;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-sniglet), var(--font-comfortaa), sans-serif;
  --tipo-cartel: var(--font-sniglet), sans-serif;
  --titulo-peso: 800;
  --cartel-escala: 0.5;
  --titulo-sombra: 2px 2px 0 #f8d9e4;

  --textura: ${T['sakura-branch-light']}, ${T['sakura-twig-light']}, ${T['sakura-petals-light']};
  --textura-tamano: min(70vw, 300px) auto, min(34vw, 150px) auto, 300px 300px;
  --textura-posicion: right bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, repeat;

  --sombra-baja: 0 1px 2px rgb(120 40 70 / 0.06), 0 2px 6px rgb(120 40 70 / 0.05);
  --sombra-alta: 0 2px 4px rgb(120 40 70 / 0.06), 0 14px 32px -10px rgb(120 40 70 / 0.26);
}

html.dark[data-tema='sakura'] {
  /* Yozakura: night picnic under the trees, paper lanterns glowing. */
  --fondo: #17121f;
  --superficie: #211a2b;
  --superficie-alta: #2a2236;
  --tinta: #f6ecf2;
  --tinta-suave: #bfaebb;
  --acento: #f59ac0;
  --sobre-acento: #17121f;
  --acento-suave: #3b2538;
  --borde: #352a40;
  --estrella-vacia: #463a52;

  --durazno: #f0c46c;
  --menta: #8fd4b4;
  --sobre-persona: #17121f;

  --titulo-sombra: 0 0 12px rgb(245 154 192 / 0.45);
  --textura: ${T['sakura-branch-dark']}, ${T['sakura-twig-dark']}, ${T['sakura-petals-dark']};
}
`;
