import { T } from './textures/dragones';

export default /* css */ `
html[data-tema='grimorio'] {
  /* A spellbook: a glowing rune circle, three candles and a small dragon familiar flying over the page. */
  --fondo: #ebe4f0;
  --superficie: #f9f6fb;
  --superficie-alta: #ffffff;
  --tinta: #1e1229;
  --tinta-suave: #4d3d5c;
  --acento: #6a2fb0;
  --sobre-acento: #ffffff;
  --acento-suave: #e2d4f3;
  --borde: #b9a3d3;
  --estrella-vacia: #d3c7df;
  --radio: 0.25rem;

  --durazno: #8a4a00;
  --menta: #1f6b5a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-grenze), Georgia, serif;
  --tipo-cartel: var(--font-grenze), Georgia, serif;
  --titulo-peso: 700;
  --cartel-escala: 0.64;
  --borde-ancho: 2px;
  --sombra-baja: 0 0 0 1px var(--borde), 0 2px 8px rgb(106 47 176 / 0.12);
  --sombra-alta: 0 0 0 1px var(--borde), 0 14px 32px -10px rgb(106 47 176 / 0.4);
  --titulo-sombra: 0 0 10px rgb(124 63 192 / 0.45);

  --textura:
    ${T['grimorio-circle-light']},
    ${T['grimorio-candles-light']},
    ${T['grimorio-familiar-light']},
    ${T['grimorio-pattern-light']};
  --textura-tamano: min(62vw, 270px) auto, min(32vw, 130px) auto, min(38vw, 160px) auto, 180px 180px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='grimorio'] {
  /* The grimoire opened at midnight: the runes glow. */
  --fondo: #120a1c;
  --superficie: #1c1229;
  --superficie-alta: #251933;
  --tinta: #f1e9fa;
  --tinta-suave: #b9a8cc;
  --acento: #c39bff;
  --sobre-acento: #120a1c;
  --acento-suave: #33204a;
  --borde: #3d2a57;
  --estrella-vacia: #33264a;

  --durazno: #f2b65a;
  --menta: #6fe0c0;
  --sobre-persona: #120a1c;

  --sombra-baja: 0 0 0 1px var(--borde), 0 0 12px rgb(185 140 255 / 0.12);
  --sombra-alta: 0 0 0 1px var(--borde), 0 0 28px rgb(185 140 255 / 0.25);
  --titulo-sombra: 0 0 16px rgb(185 140 255 / 0.75);
  --textura:
    ${T['grimorio-circle-dark']},
    ${T['grimorio-candles-dark']},
    ${T['grimorio-familiar-dark']},
    ${T['grimorio-pattern-dark']};
}
`;
