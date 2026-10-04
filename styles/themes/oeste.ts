import { T } from './textures/sorpresas';

export default /* css */ `
html[data-tema='oeste'] {
  /* Frontier town: a wanted poster, saguaro, the sheriff's star, wood-plank cards. */
  --fondo: #f0dab0;
  --superficie: #fbf1dc;
  --superficie-alta: #fff8ea;
  --tinta: #2a1a0e;
  --tinta-suave: #5c4632;
  --acento: #a3341a;
  --sobre-acento: #ffffff;
  --acento-suave: #f0cdb5;
  --borde: #d2b07c;
  --estrella-vacia: #d3b78b;
  --radio: 0.25rem;

  --durazno: #1d5d6a;
  --menta: #4a6a1c;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-rye), Georgia, serif;
  --tipo-cartel: var(--font-rye), Georgia, serif;
  --titulo-peso: 400;
  --cartel-escala: 0.55;
  --borde-ancho: 2px;
  --sombra-baja: 3px 3px 0 #d2b07c;
  --sombra-alta: 5px 5px 0 #d2b07c;
  --tarjeta-textura: repeating-linear-gradient(to bottom, transparent 0 9px, rgb(120 70 30 / 0.045) 9px 10px, transparent 10px 23px, rgb(120 70 30 / 0.03) 23px 24px);

  --textura: ${T['oeste-rb-light']}, ${T['oeste-lb-light']}, ${T['oeste-rt-light']}, ${T['oeste-pattern-light']};
  --textura-tamano: min(58vw, 260px) auto, min(36vw, 160px) auto, min(26vw, 110px) auto, 180px 180px;
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='oeste'] {
  /* The saloon after dark: lamplight on old wood. */
  --fondo: #1a120c;
  --superficie: #261a10;
  --superficie-alta: #302216;
  --tinta: #f6e6cc;
  --tinta-suave: #c2ab8c;
  --acento: #f08a5d;
  --sobre-acento: #1a120c;
  --acento-suave: #43261a;
  --borde: #4a3420;
  --estrella-vacia: #4a3624;

  --durazno: #7fd0d8;
  --menta: #b6d36a;
  --sobre-persona: #1a120c;

  --sombra-baja: 3px 3px 0 #0d0905;
  --sombra-alta: 5px 5px 0 #0d0905;
  --tarjeta-textura: repeating-linear-gradient(to bottom, transparent 0 9px, rgb(255 220 170 / 0.03) 9px 10px, transparent 10px 23px, rgb(255 220 170 / 0.02) 23px 24px);

  --textura: ${T['oeste-rb-dark']}, ${T['oeste-lb-dark']}, ${T['oeste-rt-dark']}, ${T['oeste-pattern-dark']};
}
`;
