export default /* css */ `
html[data-tema='mariposas'] {
  /* Un hada volando con su estela de polvo, y mariposas por toda la hoja. */
  --fondo: #edf2f8;
  --superficie: #fbfcfe;
  --superficie-alta: #ffffff;
  --tinta: #1f2533;
  --tinta-suave: #4d566b;
  --acento: #4a5bb0;
  --sobre-acento: #ffffff;
  --acento-suave: #dde3f5;
  --borde: #d9e0ec;
  --estrella-vacia: #c6cfe0;
  --radio: 1.25rem;

  --durazno: #8a5e0e;
  --menta: #a8456a;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--font-lora), Georgia, serif;
  --tipo-titulo: var(--font-comfortaa), sans-serif;
  --tipo-cartel: var(--font-comfortaa), sans-serif;
  --titulo-peso: 700;
  --titulo-espaciado: 0.03em;
  --cartel-escala: 0.54;

  --textura:
    url('/textures/mariposas-5a2fa61de5.svg'),
    url('/textures/mariposas-e0fca08b5f.svg'),
    url('/textures/mariposas-b236a57b6b.svg'),
    url('/textures/mariposas-28b29557cd.svg');
  --trama: 320px 320px;
  /* El marco va pegado a las esquinas de la pantalla, como en los dibujos:
     lo grande abajo a la derecha, lejos de la sidebar, y en el celular por
     encima de la tab bar y debajo de la cabecera. La última capa, la única que se repite, es el polvo
     del fondo. */
  --textura-tamano: min(56vw, 250px) auto, min(38vw, 170px) auto, min(36vw, 160px) auto, var(--trama);
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;

  --sombra-baja: 0 1px 2px rgb(30 40 80 / 0.05), 0 2px 6px rgb(30 40 80 / 0.04);
  --sombra-alta: 0 2px 4px rgb(30 40 80 / 0.05), 0 14px 32px -10px rgb(30 40 80 / 0.22);
}

html.dark[data-tema='mariposas'] {
  --fondo: #11141c;
  --superficie: #1a1e29;
  --superficie-alta: #232836;
  --tinta: #edf1f8;
  --tinta-suave: #a8b0c4;
  --acento: #a3b1f2;
  --sobre-acento: #11141c;
  --acento-suave: #262c45;
  --borde: #2a3040;
  --estrella-vacia: #373e52;

  --durazno: #efc26b;
  --menta: #f09bb8;
  --sobre-persona: #11141c;

  --textura:
    url('/textures/mariposas-509249f44c.svg'),
    url('/textures/mariposas-8911d7be37.svg'),
    url('/textures/mariposas-eae4dbf903.svg'),
    url('/textures/mariposas-d7d9e9e67f.svg');
}
`;
