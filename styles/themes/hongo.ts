export default /* css */ `
html[data-tema='hongo'] {
  /* El hada sentada en un hongo lila, entre helechos y lavanda. */
  --fondo: #f2ecf3;
  --superficie: #fdfafd;
  --superficie-alta: #ffffff;
  --tinta: #27212c;
  --tinta-suave: #594f62;
  --acento: #7b4a8e;
  --sobre-acento: #ffffff;
  --acento-suave: #e9dcef;
  --borde: #e3d7e8;
  --estrella-vacia: #d6c8dd;
  --radio: 1.125rem;

  --durazno: #8a5e0e;
  --menta: #3d6e2f;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--font-lora), Georgia, serif;
  --tipo-titulo: var(--font-chewy), cursive;
  --tipo-cartel: var(--font-chewy), cursive;
  --titulo-peso: 400;
  --borde-ancho: 2px;
  --borde-estilo: dotted;
  --cartel-escala: 0.72;

  --textura:
    url('/textures/hongo-5409fb9e66.svg'),
    url('/textures/hongo-e6fa51f132.svg'),
    url('/textures/hongo-57b873d627.svg'),
    url('/textures/hongo-c7055b0a4f.svg');
  --trama: 300px 300px;
  /* El marco va pegado a las esquinas de la pantalla, como en los dibujos:
     lo grande abajo a la derecha, lejos de la sidebar, y en el celular por
     encima de la tab bar y debajo de la cabecera. La última capa, la única que se repite, es el polvo
     del fondo. */
  --textura-tamano: min(56vw, 250px) auto, min(38vw, 170px) auto, min(36vw, 160px) auto, var(--trama);
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;

  --sombra-baja: 0 1px 2px rgb(60 30 70 / 0.06), 0 2px 6px rgb(60 30 70 / 0.05);
  --sombra-alta: 0 2px 4px rgb(60 30 70 / 0.06), 0 14px 32px -10px rgb(60 30 70 / 0.26);
}

html.dark[data-tema='hongo'] {
  --fondo: #16121a;
  --superficie: #201a26;
  --superficie-alta: #29222f;
  --tinta: #f2ecf5;
  --tinta-suave: #b5a9bf;
  --acento: #cfa3e0;
  --sobre-acento: #16121a;
  --acento-suave: #35283d;
  --borde: #332a3a;
  --estrella-vacia: #43384b;

  --durazno: #e9c46a;
  --menta: #9ccf85;
  --sobre-persona: #16121a;

  --textura:
    url('/textures/hongo-a5bb284541.svg'),
    url('/textures/hongo-b10f7987cf.svg'),
    url('/textures/hongo-61676bebd7.svg'),
    url('/textures/hongo-251563eb03.svg');
}
`;
