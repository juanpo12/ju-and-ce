import { T } from './textures/espacio';

export default /* css */ `
html[data-tema='clasificado'] {
  /* A government dossier: manila folders, a stamped «CLASIFICADO», redacted
     lines and a paper-clipped photo of something that is not a weather balloon. */
  --fondo: #e8dcbb;
  --superficie: #fbf6e8;
  --superficie-alta: #fffdf6;
  --tinta: #1a160f;
  --tinta-suave: #4f4636;
  --acento: #a3221b;
  --sobre-acento: #ffffff;
  --acento-suave: #f1d4c6;
  --borde: #d9c99f;
  --estrella-vacia: #cdbb8e;
  --radio: 0.25rem;

  --durazno: #7a4f0a;
  --menta: #2f5f8a;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--font-special-elite), 'Courier New', monospace;
  --tipo-titulo: var(--font-special-elite), 'Courier New', monospace;
  --tipo-cartel: var(--font-special-elite), 'Courier New', monospace;
  --titulo-peso: 400;
  --cartel-escala: 0.58;
  --sombra-baja: 2px 3px 0 rgb(60 45 20 / 0.14);
  --sombra-alta: 3px 5px 0 rgb(60 45 20 / 0.16), 0 14px 28px -12px rgb(60 45 20 / 0.3);

  /* Typing paper: ruled lines, barely there. */
  --tarjeta-textura: repeating-linear-gradient(to bottom, transparent 0 1.45rem, rgb(120 100 60 / 0.08) 1.45rem 1.5rem);

  --textura:
    ${T['clasificado-dossier-light']},
    ${T['clasificado-memo-light']},
    ${T['clasificado-seal-light']},
    ${T['clasificado-pattern-light']};
  --textura-tamano: min(56vw, 240px) auto, min(36vw, 150px) auto, min(26vw, 105px) auto, 220px 220px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right 4px top calc(var(--bajo-cabecera) + 4px), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='clasificado'] {
  /* The same file read on a night-vision monitor: phosphor green and scanlines. */
  --fondo: #06120a;
  --superficie: #0b1d10;
  --superficie-alta: #10271a;
  --tinta: #c8ffd2;
  --tinta-suave: #7fc191;
  --acento: #6dff86;
  --sobre-acento: #06120a;
  --acento-suave: #133a1d;
  --borde: #1b4527;
  --estrella-vacia: #22502f;

  --durazno: #e6ff6a;
  --menta: #6fe3ff;
  --sobre-persona: #06120a;

  --titulo-sombra: 0 0 8px rgb(109 255 134 / 0.6);
  --sombra-baja: 0 0 0 1px #1b4527;
  --sombra-alta: 0 0 0 1px #2a6a3a, 0 0 24px -8px rgb(109 255 134 / 0.35);
  --tarjeta-textura: repeating-linear-gradient(to bottom, rgb(109 255 134 / 0.035) 0 1px, transparent 1px 3px);

  --textura:
    ${T['clasificado-dossier-dark']},
    ${T['clasificado-memo-dark']},
    ${T['clasificado-seal-dark']},
    ${T['clasificado-pattern-dark']};
  --textura-tamano: min(56vw, 240px) auto, min(36vw, 150px) auto, min(26vw, 105px) auto, 200px 200px;
}
`;
