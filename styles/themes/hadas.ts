export default /* css */ `
html[data-tema='hadas'] {
  /* El hada sobre el hongo: pergamino verde salvia, flores lavanda y
     destellos dorados de cuatro puntas, como los del cielo del dibujo. */
  --fondo: #eeeed6;
  --superficie: #fbfbef;
  --superficie-alta: #ffffff;
  --tinta: #24261a;
  --tinta-suave: #585a44;
  --acento: #6c5596;
  --sobre-acento: #ffffff;
  --acento-suave: #e4def0;
  --borde: #dcdcbf;
  --estrella-vacia: #cfcfb0;
  --radio: 1.125rem;

  /* Oro de las estrellas y verde helecho: ninguno se confunde con la lavanda. */
  --durazno: #8a5e0e;
  --menta: #3d6e2f;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--font-lora), Georgia, serif;
  --tipo-titulo: var(--font-dancing), cursive;
  --tipo-cartel: var(--font-cormorant), Georgia, serif;
  --titulo-peso: 700;
  --cartel-escala: 0.66;

  --textura: url('/textures/hadas-45e6160bfd.svg');
  --textura-tamano: 200px 200px;

  --sombra-baja: 0 1px 2px rgb(50 55 20 / 0.06), 0 2px 6px rgb(50 55 20 / 0.05);
  --sombra-alta: 0 2px 4px rgb(50 55 20 / 0.06), 0 14px 32px -10px rgb(50 55 20 / 0.26);
}

html.dark[data-tema='hadas'] {
  /* El mismo claro del bosque, de noche: las estrellas quedan encendidas. */
  --fondo: #13170f;
  --superficie: #1c2217;
  --superficie-alta: #252c1f;
  --tinta: #eef0de;
  --tinta-suave: #b0b49a;
  --acento: #b9a5e8;
  --sobre-acento: #13170f;
  --acento-suave: #2e2940;
  --borde: #2c3324;
  --estrella-vacia: #3a4230;

  --durazno: #e9c46a;
  --menta: #9ccf85;
  --sobre-persona: #13170f;

  --textura: url('/textures/hadas-de1ef8c306.svg');
}
`;
