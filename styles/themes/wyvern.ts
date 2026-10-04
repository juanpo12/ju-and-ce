import { T } from './textures/dragones';

export default /* css */ `
html[data-tema='wyvern'] {
  /* Emerald scales everywhere, and a wyvern flying over a pine forest. */
  --fondo: #e3eee3;
  --superficie: #f7fbf6;
  --superficie-alta: #ffffff;
  --tinta: #0f2318;
  --tinta-suave: #3a5445;
  --acento: #1d6b45;
  --sobre-acento: #ffffff;
  --acento-suave: #cfe6d6;
  --borde: #9cbfa8;
  --estrella-vacia: #c2d6c6;
  --radio: 0.5rem 0.125rem;

  --durazno: #8a4a12;
  --menta: #5a3f8f;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-almendra), Georgia, serif;
  --tipo-cartel: var(--font-almendra), Georgia, serif;
  --titulo-peso: 700;
  --cartel-escala: 0.66;
  --borde-ancho: 2px;
  --sombra-baja: 2px 2px 0 var(--borde);
  --sombra-alta: 4px 4px 0 var(--borde);

  --textura:
    ${T['wyvern-flying-light']},
    ${T['wyvern-forest-light']},
    ${T['wyvern-scales-light']};
  --textura-tamano: min(40vw, 170px) auto, min(80vw, 330px) auto, 32px 24px;
  --textura-posicion: right top var(--bajo-cabecera), right bottom var(--sobre-tab-bar), 0 0;
  --textura-repetir: no-repeat, no-repeat, repeat;
}

html.dark[data-tema='wyvern'] {
  /* The forest at dusk: dark pines and a wyvern in silhouette. */
  --fondo: #0b1a12;
  --superficie: #12261b;
  --superficie-alta: #183022;
  --tinta: #e6f3ea;
  --tinta-suave: #a3c2ad;
  --acento: #6fd39b;
  --sobre-acento: #0b1a12;
  --acento-suave: #1d3d2b;
  --borde: #2e5a43;
  --estrella-vacia: #2a4636;

  --durazno: #f0b35a;
  --menta: #c3a6f5;
  --sobre-persona: #0b1a12;

  --sombra-baja: 2px 2px 0 var(--borde);
  --sombra-alta: 4px 4px 0 var(--borde);
  --textura:
    ${T['wyvern-flying-dark']},
    ${T['wyvern-forest-dark']},
    ${T['wyvern-scales-dark']};
}
`;
