import { T } from './textures/dragones';

export default /* css */ `
html[data-tema='torneo'] {
  /* A jousting tournament: pennant bunting, crossed lances over a shield, a striped tent and harlequin diamonds. Gules and azure. */
  --fondo: #f2ead8;
  --superficie: #fffaf0;
  --superficie-alta: #ffffff;
  --tinta: #1a1420;
  --tinta-suave: #4a3f52;
  --acento: #b3202c;
  --sobre-acento: #ffffff;
  --acento-suave: #f4d3d0;
  --borde: #1f4e9c;
  --estrella-vacia: #d8cdb6;
  --radio: 0;

  --durazno: #7a5600;
  --menta: #1f4e9c;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-grenze), Georgia, serif;
  --tipo-cartel: var(--font-grenze), Georgia, serif;
  --titulo-peso: 700;
  --cartel-escala: 0.64;
  --borde-ancho: 3px;
  --sombra-baja: 3px 3px 0 var(--borde);
  --sombra-alta: 5px 5px 0 var(--borde);
  --titulo-sombra: 2px 2px 0 #d9a62a;

  --textura:
    ${T['torneo-bunting-light']},
    ${T['torneo-shields-light']},
    ${T['torneo-tent-light']},
    ${T['torneo-harlequin-light']};
  --textura-tamano: min(58vw, 250px) auto, min(54vw, 240px) auto, min(40vw, 170px) auto, 40px 60px;
  --textura-posicion: right top var(--bajo-cabecera), right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;
}

html.dark[data-tema='torneo'] {
  /* The tournament after sundown: the banners in torchlight. */
  --fondo: #13111a;
  --superficie: #1d1a26;
  --superficie-alta: #26222f;
  --tinta: #f3ecdd;
  --tinta-suave: #bcb1c4;
  --acento: #ff6b6b;
  --sobre-acento: #13111a;
  --acento-suave: #4a1d22;
  --borde: #3d5fa8;
  --estrella-vacia: #3a3445;

  --durazno: #e8c25a;
  --menta: #8cb4ff;
  --sobre-persona: #13111a;

  --sombra-baja: 3px 3px 0 var(--borde);
  --sombra-alta: 5px 5px 0 var(--borde);
  --titulo-sombra: 2px 2px 0 #7a1a20;
  --textura:
    ${T['torneo-bunting-dark']},
    ${T['torneo-shields-dark']},
    ${T['torneo-tent-dark']},
    ${T['torneo-harlequin-dark']};
}
`;
