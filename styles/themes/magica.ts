import { T } from './textures/anime';

export default /* css */ `
html[data-tema='magica'] {
  /* Magical girl transformation: pastel sparkles, a crescent wand, ribbons. */
  --fondo: #fdf0fa;
  --superficie: #fffaff;
  --superficie-alta: #ffffff;
  --tinta: #2d1d33;
  --tinta-suave: #614c6b;
  --acento: #b0359a;
  --sobre-acento: #ffffff;
  --acento-suave: #f6d6f0;
  --borde: #f0d4ec;
  --estrella-vacia: #e3c6df;
  --radio: 1.5rem;

  --durazno: #1f6f8b;
  --menta: #2f7a52;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-sniglet), var(--font-coiny), sans-serif;
  --tipo-cartel: var(--font-coiny), sans-serif;
  --titulo-peso: 800;
  --cartel-escala: 0.5;
  --titulo-sombra: 0 0 10px rgb(255 143 207 / 0.75), 2px 2px 0 #ffd1f0;
  --borde-ancho: 2px;

  --textura: ${T['magica-wand-light']}, ${T['magica-moon-light']}, ${T['magica-sparkles-light']};
  --textura-tamano: min(66vw, 280px) auto, min(30vw, 130px) auto, 260px 260px;
  --textura-posicion: right bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, repeat;

  --sombra-baja: 0 1px 2px rgb(176 53 154 / 0.08), 0 2px 8px rgb(176 53 154 / 0.08);
  --sombra-alta: 0 0 0 2px #f6d6f0, 0 14px 32px -10px rgb(176 53 154 / 0.35);
}

html.dark[data-tema='magica'] {
  /* The night patrol under a full moon. */
  --fondo: #1a1024;
  --superficie: #241632;
  --superficie-alta: #2e1d3f;
  --tinta: #fbefff;
  --tinta-suave: #c6b0d1;
  --acento: #ff9be0;
  --sobre-acento: #1a1024;
  --acento-suave: #43224e;
  --borde: #3c2650;
  --estrella-vacia: #4d3660;

  --durazno: #8fd8f0;
  --menta: #a6e8b8;
  --sobre-persona: #1a1024;

  --titulo-sombra: 0 0 14px rgb(255 155 224 / 0.7);
  --textura: ${T['magica-wand-dark']}, ${T['magica-moon-dark']}, ${T['magica-sparkles-dark']};
  --sombra-alta: 0 0 0 2px #43224e, 0 16px 36px -12px rgb(0 0 0 / 0.7);
}
`;
