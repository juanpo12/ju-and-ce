import { T } from './textures/sorpresas';

export default /* css */ `
html[data-tema='vaporwave'] {
  /* Pastel pink mall at dusk: striped sun over a cyan grid, palm silhouettes. */
  --fondo: #fbe4f2;
  --superficie: #fff8fc;
  --superficie-alta: #ffffff;
  --tinta: #1f1030;
  --tinta-suave: #5a3f6e;
  --acento: #a8126f;
  --sobre-acento: #ffffff;
  --acento-suave: #f8d3ea;
  --borde: #efc7e2;
  --estrella-vacia: #e4b9d6;
  --radio: 0.25rem;

  --durazno: #006d85;
  --menta: #5b2fb0;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-audiowide), sans-serif;
  --tipo-cartel: var(--font-monoton), var(--font-audiowide), sans-serif;
  --titulo-peso: 400;
  --titulo-espaciado: 0.02em;
  --cartel-escala: 0.5;
  --borde-ancho: 2px;
  --titulo-sombra: 2px 2px 0 #3ad6f2, 4px 4px 0 #ff8fd0;
  --sombra-baja: 3px 3px 0 #8be7f7;
  --sombra-alta: 6px 6px 0 #8be7f7;

  --textura: ${T['vaporwave-rb-light']}, ${T['vaporwave-lb-light']}, ${T['vaporwave-rt-light']}, ${T['vaporwave-pattern-light']};
  --textura-tamano: min(62vw, 270px) auto, min(32vw, 140px) auto, min(24vw, 110px) auto, 140px 140px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='vaporwave'] {
  /* The same mall after midnight: neon on deep violet. */
  --fondo: #12081f;
  --superficie: #1d0f33;
  --superficie-alta: #27154a;
  --tinta: #fbefff;
  --tinta-suave: #c9b2e0;
  --acento: #ff71ce;
  --sobre-acento: #12081f;
  --acento-suave: #3c1a4d;
  --borde: #3a2160;
  --estrella-vacia: #4a2f6e;

  --durazno: #01cdfe;
  --menta: #b98cff;
  --sobre-persona: #12081f;

  --titulo-sombra: 0 0 10px #ff71ce, 2px 2px 0 #01a8d0;
  --sombra-baja: 3px 3px 0 #0a8fb3;
  --sombra-alta: 0 0 18px rgb(255 113 206 / 0.25), 6px 6px 0 #0a8fb3;

  --textura: ${T['vaporwave-rb-dark']}, ${T['vaporwave-lb-dark']}, ${T['vaporwave-rt-dark']}, ${T['vaporwave-pattern-dark']};
}
`;
