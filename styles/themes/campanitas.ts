export default /* css */ `
html[data-tema='campanitas'] {
  /* Lirios del valle altos como árboles para dos hadas: una en un hongo, otra
     volando entre las flores. */
  --fondo: #e9f3f1;
  --superficie: #fbfdfd;
  --superficie-alta: #ffffff;
  --tinta: #1d2a28;
  --tinta-suave: #4a5c59;
  --acento: #23706b;
  --sobre-acento: #ffffff;
  --acento-suave: #d3ebe6;
  --borde: #d1e4e0;
  --estrella-vacia: #bcd6d1;
  --radio: 1rem;

  --durazno: #8a5e0e;
  --menta: #a8456a;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--font-lora), Georgia, serif;
  --tipo-titulo: var(--font-mali), cursive;
  --tipo-cartel: var(--font-mali), cursive;
  --titulo-peso: 700;
  --borde-ancho: 2px;
  --cartel-escala: 0.62;

  --textura:
    url('/textures/campanitas-d7c93147f2.svg'),
    url('/textures/campanitas-9c0b6cad55.svg'),
    url('/textures/campanitas-cfcc9af816.svg'),
    url('/textures/campanitas-c22f740989.svg');
  --trama: 280px 280px;
  /* El marco va pegado a las esquinas de la pantalla, como en los dibujos:
     lo grande abajo a la derecha, lejos de la sidebar, y en el celular por
     encima de la tab bar y debajo de la cabecera. La última capa, la única que se repite, es el polvo
     del fondo. */
  --textura-tamano: min(56vw, 250px) auto, min(38vw, 170px) auto, min(36vw, 160px) auto, var(--trama);
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;

  --sombra-baja: 0 1px 2px rgb(20 60 55 / 0.06), 0 2px 6px rgb(20 60 55 / 0.05);
  --sombra-alta: 0 2px 4px rgb(20 60 55 / 0.06), 0 14px 32px -10px rgb(20 60 55 / 0.24);
}

html.dark[data-tema='campanitas'] {
  --fondo: #0f1817;
  --superficie: #172321;
  --superficie-alta: #1f2d2b;
  --tinta: #eaf5f3;
  --tinta-suave: #a3bab6;
  --acento: #7fd1c6;
  --sobre-acento: #0f1817;
  --acento-suave: #1d3835;
  --borde: #263835;
  --estrella-vacia: #334744;

  --durazno: #efc26b;
  --menta: #f09bb8;
  --sobre-persona: #0f1817;

  --textura:
    url('/textures/campanitas-4c2e6709a0.svg'),
    url('/textures/campanitas-b5b35690f6.svg'),
    url('/textures/campanitas-b0e8100320.svg'),
    url('/textures/campanitas-dc0c4f558a.svg');
}
`;
