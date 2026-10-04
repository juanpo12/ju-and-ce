import { T } from './textures/dragones';

export default /* css */ `
html[data-tema='hielo'] {
  /* Frost and silver: an ice dragon curled asleep, icicles hanging under the header and snow drifting. */
  --fondo: #e6f0f7;
  --superficie: #f8fbfe;
  --superficie-alta: #ffffff;
  --tinta: #0f2233;
  --tinta-suave: #3d556b;
  --acento: #1f5f99;
  --sobre-acento: #ffffff;
  --acento-suave: #d3e6f5;
  --borde: #a9c7de;
  --estrella-vacia: #c2d6e6;
  --radio: 0.5rem;

  --durazno: #7a4fa0;
  --menta: #0f6e6e;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-cinzel-deco), Georgia, serif;
  --tipo-cartel: var(--font-cinzel-deco), Georgia, serif;
  --titulo-peso: 700;
  --cartel-escala: 0.5;
  --borde-ancho: 3px;
  --borde-estilo: double;
  --sombra-baja: 0 2px 0 var(--borde);
  --sombra-alta: 0 2px 0 var(--borde), 0 14px 30px -12px rgb(31 95 153 / 0.35);
  --titulo-sombra: 0 1px 0 #ffffff, 0 0 12px rgb(127 179 214 / 0.8);

  --textura:
    ${T['hielo-dragon-light']},
    ${T['hielo-icicles-light']},
    ${T['hielo-flakes-light']},
    ${T['hielo-pattern-light']};
  --textura-tamano: min(62vw, 270px) auto, min(50vw, 210px) auto, min(32vw, 130px) auto, 180px 180px;
  --textura-posicion: right bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), left bottom var(--sobre-tab-bar), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='hielo'] {
  /* A polar night: the dragon is a shadow of blue ice. */
  --fondo: #0b1622;
  --superficie: #13212f;
  --superficie-alta: #1a2b3c;
  --tinta: #e8f3fb;
  --tinta-suave: #a3bccf;
  --acento: #8cc8f0;
  --sobre-acento: #0b1622;
  --acento-suave: #1d3850;
  --borde: #2c4a63;
  --estrella-vacia: #2c4054;

  --durazno: #c9a6f0;
  --menta: #6fd6c8;
  --sobre-persona: #0b1622;

  --sombra-baja: 0 2px 0 var(--borde);
  --sombra-alta: 0 0 0 1px var(--borde), 0 14px 32px -12px rgb(140 200 240 / 0.25);
  --titulo-sombra: 0 0 14px rgb(140 200 240 / 0.6);
  --textura:
    ${T['hielo-dragon-dark']},
    ${T['hielo-icicles-dark']},
    ${T['hielo-flakes-dark']},
    ${T['hielo-pattern-dark']};
}
`;
