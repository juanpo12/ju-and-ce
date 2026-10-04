import { T } from './textures/anime';

export default /* css */ `
html[data-tema='shonen'] {
  /* Battle manga: speed lines, a ¡PAM! burst, ink-black borders and hard shadows. */
  --fondo: #fff3d6;
  --superficie: #fffaf0;
  --superficie-alta: #ffffff;
  --tinta: #1a1410;
  --tinta-suave: #4f4337;
  --acento: #b8390a;
  --sobre-acento: #ffffff;
  --acento-suave: #ffd9b8;
  --borde: #1a1410;
  --estrella-vacia: #e0c9a0;
  --radio: 0.35rem;

  --durazno: #1d5fb8;
  --menta: #2f6e2f;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-lilita), Impact, sans-serif;
  --tipo-cartel: var(--font-bangers), Impact, sans-serif;
  --titulo-peso: 400;
  --titulo-mayusculas: uppercase;
  --titulo-espaciado: 0.03em;
  --cartel-escala: 0.95;
  --borde-ancho: 3px;
  --titulo-sombra: 2px 2px 0 #ffc21a;

  --textura: ${T['shonen-burst-light']}, ${T['shonen-star-light']}, ${T['shonen-streaks-light']};
  --textura-tamano: min(50vw, 210px) auto, min(28vw, 120px) auto, 240px 240px;
  --textura-posicion: right bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, repeat;

  --sombra-baja: 3px 3px 0 #1a1410;
  --sombra-alta: 6px 6px 0 #1a1410;
}

html.dark[data-tema='shonen'] {
  /* The final fight at night: orange aura on black ink. */
  --fondo: #14100c;
  --superficie: #1f1913;
  --superficie-alta: #2a221a;
  --tinta: #fff4e3;
  --tinta-suave: #c9b79f;
  --acento: #ff8a3d;
  --sobre-acento: #14100c;
  --acento-suave: #3d2414;
  --borde: #e8a400;
  --estrella-vacia: #3f3326;

  --durazno: #7fb2ff;
  --menta: #8fdc7f;
  --sobre-persona: #14100c;

  --titulo-sombra: 2px 2px 0 #b84a10;
  --textura: ${T['shonen-burst-dark']}, ${T['shonen-star-dark']}, ${T['shonen-streaks-dark']};
  --sombra-baja: 3px 3px 0 #b84a10;
  --sombra-alta: 6px 6px 0 #b84a10;
}
`;
