import { T } from './textures/sorpresas';

export default /* css */ `
html[data-tema='comic'] {
  /* Pop-art comic page: Ben-Day dots, thick ink outlines, ¡POW! and ¡ZAS!. */
  --fondo: #fff1b8;
  --superficie: #ffffff;
  --superficie-alta: #ffffff;
  --tinta: #111111;
  --tinta-suave: #3d3d3d;
  --acento: #d0121b;
  --sobre-acento: #ffffff;
  --acento-suave: #ffd6d0;
  --borde: #111111;
  --estrella-vacia: #c9c9c9;
  --radio: 0.3rem;

  --durazno: #0b57c9;
  --menta: #1a7a2c;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-bangers), Impact, sans-serif;
  --tipo-cartel: var(--font-bangers), Impact, sans-serif;
  --titulo-peso: 400;
  --titulo-mayusculas: uppercase;
  --titulo-espaciado: 0.05em;
  --cartel-escala: 0.88;
  --borde-ancho: 3px;
  --titulo-sombra: 3px 3px 0 #ff5a5f;
  --sombra-baja: 3px 3px 0 #111111;
  --sombra-alta: 6px 6px 0 #111111;

  --textura: ${T['comic-rb-light']}, ${T['comic-lb-light']}, ${T['comic-rt-light']}, ${T['comic-pattern-light']};
  --textura-tamano: min(46vw, 200px) auto, min(34vw, 150px) auto, min(34vw, 150px) auto, 14px 14px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='comic'] {
  /* The night panel: ink-blue sky, same loud colors. */
  --fondo: #0f1a3d;
  --superficie: #18245a;
  --superficie-alta: #212e6b;
  --tinta: #fffbea;
  --tinta-suave: #c9cfe8;
  --acento: #ff6b6f;
  --sobre-acento: #0f1a3d;
  --acento-suave: #3b2050;
  --borde: #05081a;
  --estrella-vacia: #33407a;

  --durazno: #ffd400;
  --menta: #5fe08a;
  --sobre-persona: #0f1a3d;

  --titulo-sombra: 3px 3px 0 #d0121b;
  --sombra-baja: 3px 3px 0 #05081a;
  --sombra-alta: 6px 6px 0 #05081a;

  --textura: ${T['comic-rb-dark']}, ${T['comic-lb-dark']}, ${T['comic-rt-dark']}, ${T['comic-pattern-dark']};
}
`;
