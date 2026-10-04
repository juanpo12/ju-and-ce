import { T } from './textures/espacio';

export default /* css */ `
html[data-tema='orbital'] {
  /* A space station HUD: hex grid, readouts and corner brackets, the station
     with its solar panels over the curve of the Earth. Light mode is the
     clean white lab on board. */
  --fondo: #eef3f7;
  --superficie: #ffffff;
  --superficie-alta: #ffffff;
  --tinta: #0c1824;
  --tinta-suave: #3e5266;
  --acento: #0a6688;
  --sobre-acento: #ffffff;
  --acento-suave: #d3eaf3;
  --borde: #c9d8e3;
  --estrella-vacia: #bccad6;
  --radio: 0.25rem;

  --durazno: #b24a10;
  --menta: #5b45b0;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-chakra), sans-serif;
  --tipo-cartel: var(--font-chakra), sans-serif;
  --titulo-peso: 700;
  --titulo-mayusculas: uppercase;
  --titulo-espaciado: 0.03em;
  --cartel-escala: 0.6;
  --sombra-baja: 0 0 0 1px var(--borde);
  --sombra-alta: 0 0 0 1px var(--borde), 0 12px 28px -12px rgb(10 102 136 / 0.35);

  /* A thin instrument line along the top of every panel. */
  --tarjeta-textura: linear-gradient(to bottom, color-mix(in srgb, var(--acento) 70%, transparent) 0 2px, transparent 2px);

  --textura:
    ${T['orbital-station-light']},
    ${T['orbital-hud2-light']},
    ${T['orbital-hud-light']},
    ${T['orbital-pattern-light']};
  --textura-tamano: min(56vw, 240px) auto, min(34vw, 140px) auto, min(32vw, 130px) auto, 48px auto;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right 4px top calc(var(--bajo-cabecera) + 4px), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='orbital'] {
  /* Lights off in the station: navy, cyan readouts, the Earth glowing. */
  --fondo: #07101f;
  --superficie: #0d1a2e;
  --superficie-alta: #12233b;
  --tinta: #e6f6ff;
  --tinta-suave: #9fbad0;
  --acento: #4fd8ff;
  --sobre-acento: #07101f;
  --acento-suave: #123552;
  --borde: #1c3350;
  --estrella-vacia: #24405f;

  --durazno: #ffb35c;
  --menta: #b9a2ff;
  --sobre-persona: #07101f;

  --titulo-sombra: 0 0 10px rgb(79 216 255 / 0.45);
  --sombra-baja: 0 0 0 1px #1c3350;
  --sombra-alta: 0 0 0 1px #1f4a6e, 0 0 28px -8px rgb(79 216 255 / 0.4);

  --textura:
    ${T['orbital-station-dark']},
    ${T['orbital-hud2-dark']},
    ${T['orbital-hud-dark']},
    ${T['orbital-pattern-dark']};
}
`;
