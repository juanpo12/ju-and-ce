import { T } from './textures/dragones';

export default /* css */ `
html[data-tema='forja'] {
  /* A dwarven forge: an anvil with a red-hot blade, a hammer mid-swing, sparks and coals. Iron and molten orange, riveted plates. */
  --fondo: #dcdcdf;
  --superficie: #f3f3f5;
  --superficie-alta: #ffffff;
  --tinta: #141518;
  --tinta-suave: #3f4249;
  --acento: #b8430f;
  --sobre-acento: #ffffff;
  --acento-suave: #f3d6c6;
  --borde: #3d3f45;
  --estrella-vacia: #c4c5ca;
  --radio: 0;

  --durazno: #7a5600;
  --menta: #1f5f8a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-metal-mania), Impact, sans-serif;
  --tipo-cartel: var(--font-metal-mania), Impact, sans-serif;
  --titulo-peso: 400;
  --cartel-escala: 0.72;
  --borde-ancho: 3px;
  --titulo-espaciado: 0.03em;
  --sombra-baja: 4px 4px 0 var(--borde);
  --sombra-alta: 6px 6px 0 var(--borde);
  --titulo-sombra: 2px 2px 0 rgb(232 84 30 / 0.5);

  --textura:
    ${T['forja-anvil-light']},
    ${T['forja-fire-light']},
    ${T['forja-embers-light']};
  --textura-tamano: min(60vw, 260px) auto, min(36vw, 150px) auto, 160px 160px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), 0 0;
  --textura-repetir: no-repeat, no-repeat, repeat;
  --tarjeta-textura: ${T['forja-plates-light']};
  --tarjeta-textura-tamano: 64px 64px;
}

html.dark[data-tema='forja'] {
  /* The forge in the dark: only the coals and the sparks light it. */
  --fondo: #101114;
  --superficie: #1a1b20;
  --superficie-alta: #22242a;
  --tinta: #f0eeea;
  --tinta-suave: #b1b3b9;
  --acento: #ff7a3a;
  --sobre-acento: #101114;
  --acento-suave: #3d2214;
  --borde: #4a4c54;
  --estrella-vacia: #2e3036;

  --durazno: #f2c14e;
  --menta: #7fc3f0;
  --sobre-persona: #101114;

  --sombra-baja: 4px 4px 0 #000000;
  --sombra-alta: 0 0 0 1px var(--borde), 0 14px 34px -10px rgb(255 106 42 / 0.35);
  --titulo-sombra: 0 0 12px rgb(255 106 42 / 0.6);
  --textura:
    ${T['forja-anvil-dark']},
    ${T['forja-fire-dark']},
    ${T['forja-embers-dark']};
  --tarjeta-textura: ${T['forja-plates-dark']};
}
`;
