import { T } from './textures/anime';

export default /* css */ `
html[data-tema='samurai'] {
  /* Ink and paper: a red rising sun, a katana over misty mountains, seigaiha waves. */
  --fondo: #f3eee2;
  --superficie: #fbf8f1;
  --superficie-alta: #ffffff;
  --tinta: #1a1d2b;
  --tinta-suave: #4a4e60;
  --acento: #b3201f;
  --sobre-acento: #ffffff;
  --acento-suave: #f1d3cc;
  --borde: #e2d9c6;
  --estrella-vacia: #d6cbb3;
  --radio: 0.2rem;

  --durazno: #8a5e0e;
  --menta: #24476e;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-shojumaru), serif;
  --tipo-cartel: var(--font-shojumaru), serif;
  --titulo-peso: 400;
  --cartel-escala: 0.45;
  --borde-ancho: 1px;

  --textura: ${T['samurai-katana-light']}, ${T['samurai-sun-light']}, ${T['samurai-waves-light']};
  --textura-tamano: min(72vw, 300px) auto, min(28vw, 120px) auto, 40px 20px;
  --textura-posicion: right bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, repeat;

  --sombra-baja: 0 1px 2px rgb(26 29 43 / 0.06), 0 2px 6px rgb(26 29 43 / 0.05);
  --sombra-alta: 3px 3px 0 #1a1d2b;
}

html.dark[data-tema='samurai'] {
  /* Moonless night in indigo, the sun turned to an ember. */
  --fondo: #111521;
  --superficie: #1a1f2e;
  --superficie-alta: #232939;
  --tinta: #f1ece0;
  --tinta-suave: #b1ab9c;
  --acento: #ff6a5c;
  --sobre-acento: #111521;
  --acento-suave: #3d1f22;
  --borde: #2c3244;
  --estrella-vacia: #3a4154;

  --durazno: #eec567;
  --menta: #8fb8f0;
  --sobre-persona: #111521;

  --textura: ${T['samurai-katana-dark']}, ${T['samurai-sun-dark']}, ${T['samurai-waves-dark']};
  --sombra-alta: 3px 3px 0 #b3201f;
}
`;
