import { T } from './textures/sorpresas';

export default /* css */ `
html[data-tema='terminal'] {
  /* Continuous-feed printer paper: green bars, tractor holes, dot-matrix ink. */
  --fondo: #f3f5ec;
  --superficie: #fbfcf7;
  --superficie-alta: #ffffff;
  --tinta: #12210f;
  --tinta-suave: #3d5338;
  --acento: #1b6e2c;
  --sobre-acento: #ffffff;
  --acento-suave: #d7ecd5;
  --borde: #b9c8b1;
  --estrella-vacia: #c3cfbd;
  --radio: 0;

  --durazno: #8a4b00;
  --menta: #1f4f8a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-vt323), monospace;
  --tipo-cartel: var(--font-vt323), monospace;
  --tipo-cita: var(--font-vt323), monospace;
  --titulo-peso: 400;
  --titulo-espaciado: 0.02em;
  --cartel-escala: 0.86;
  --borde-estilo: dashed;
  --sombra-baja: 0 1px 0 #c9d6c2;
  --sombra-alta: 0 10px 24px -12px rgb(20 40 20 / 0.35);

  --textura: ${T['terminal-holes-light']}, ${T['terminal-holes-light']}, ${T['terminal-rb-light']}, ${T['terminal-lb-light']},
    repeating-linear-gradient(to bottom, #e0eedb 0 1.5rem, transparent 1.5rem 3rem);
  --textura-tamano: 28px 32px, 28px 32px, min(32vw, 136px) auto, min(22vw, 90px) auto, auto;
  --textura-posicion: left top, right top, right bottom var(--sobre-tab-bar), left 34px bottom var(--sobre-tab-bar), 0 0;
  --textura-repetir: repeat-y, repeat-y, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='terminal'] {
  /* A phosphor CRT: green glow on black, scanlines on every card. */
  --fondo: #040904;
  --superficie: #081208;
  --superficie-alta: #0d1c0e;
  --tinta: #9dffb0;
  --tinta-suave: #5fcf78;
  --acento: #39ff6a;
  --sobre-acento: #040904;
  --acento-suave: #0f3316;
  --borde: #145a22;
  --estrella-vacia: #1d3d22;

  --durazno: #ffb000;
  --menta: #5ff0ff;
  --sobre-persona: #040904;

  --borde-estilo: solid;
  --titulo-sombra: 0 0 8px rgb(57 255 106 / 0.7);
  --sombra-baja: 0 0 0 1px #145a22;
  --sombra-alta: 0 0 22px rgb(57 255 106 / 0.18);
  --tarjeta-textura: repeating-linear-gradient(to bottom, transparent 0 2px, rgb(57 255 106 / 0.045) 2px 3px);

  --textura: ${T['terminal-rb-dark']}, ${T['terminal-lb-dark']}, ${T['terminal-pattern-dark']},
    repeating-linear-gradient(to bottom, transparent 0 2px, rgb(57 255 106 / 0.035) 2px 3px);
  --textura-tamano: min(32vw, 136px) auto, min(22vw, 90px) auto, 170px 130px, auto;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), 0 0, 0 0;
  --textura-repetir: no-repeat, no-repeat, repeat, repeat;
}
`;
