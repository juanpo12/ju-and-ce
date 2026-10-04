import { T } from './textures/espacio';

export default /* css */ `
html[data-tema='invasion'] {
  /* A 1950s sci-fi poster: cream paper, teal and rocket red, a saucer beaming
     down in the corner and a little green alien peeking up from the edge. */
  --fondo: #f3e9d2;
  --superficie: #fffaf0;
  --superficie-alta: #ffffff;
  --tinta: #1c2423;
  --tinta-suave: #4a5352;
  --acento: #b3261e;
  --sobre-acento: #ffffff;
  --acento-suave: #f6d8cf;
  --borde: #e2d3b1;
  --estrella-vacia: #d6c7a5;
  --radio: 1.25rem;

  --durazno: #855700;
  --menta: #1f6f6b;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-audiowide), sans-serif;
  --tipo-cartel: var(--font-audiowide), sans-serif;
  --titulo-peso: 400;
  --titulo-espaciado: 0.02em;
  --cartel-escala: 0.5;
  --titulo-sombra: 3px 3px 0 #f2c3b5;
  --borde-ancho: 2px;
  --sombra-baja: 3px 3px 0 #e2d3b1;
  --sombra-alta: 5px 5px 0 #1f6f6b33, 0 14px 30px -12px rgb(30 40 40 / 0.25);

  --textura:
    ${T['invasion-corner-light']},
    ${T['invasion-alien-light']},
    ${T['invasion-saucer-light']},
    ${T['invasion-pattern-light']};
  --textura-tamano: min(52vw, 230px) auto, min(28vw, 110px) auto, min(32vw, 130px) auto, 220px 220px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left 10px bottom var(--sobre-tab-bar), right 4px top calc(var(--bajo-cabecera) + 4px), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='invasion'] {
  /* The invasion itself: night sky, glowing green beams. */
  --fondo: #0b1220;
  --superficie: #131c2e;
  --superficie-alta: #1b2639;
  --tinta: #eaf2ff;
  --tinta-suave: #a8b6cc;
  --acento: #7dff8a;
  --sobre-acento: #0b1220;
  --acento-suave: #18352a;
  --borde: #24324a;
  --estrella-vacia: #2e3d56;

  --durazno: #ffcf5a;
  --menta: #7fd8ff;
  --sobre-persona: #0b1220;

  --titulo-sombra: 0 0 12px rgb(125 255 138 / 0.55);
  --sombra-baja: 0 0 0 1px #24324a, 0 2px 8px rgb(0 0 0 / 0.4);
  --sombra-alta: 0 0 0 1px #2c5a3a, 0 0 30px -8px rgb(125 255 138 / 0.4);

  --textura:
    ${T['invasion-corner-dark']},
    ${T['invasion-alien-dark']},
    ${T['invasion-saucer-dark']},
    ${T['invasion-pattern-dark']};
}
`;
