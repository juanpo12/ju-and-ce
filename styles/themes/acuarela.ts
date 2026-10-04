export default /* css */ `
html[data-tema='acuarela'] {
  /* El marco de lirios: papel de acuarela con grano, verde salvia y estrellas
     amarillas dibujadas a mano, cada una un poco torcida. */
  --fondo: #f1eadb;
  --superficie: #fcf8ef;
  --superficie-alta: #ffffff;
  --tinta: #27241c;
  --tinta-suave: #5b5646;
  --acento: #4f6d3a;
  --sobre-acento: #ffffff;
  --acento-suave: #dfe8cf;
  --borde: #e2d9c3;
  --estrella-vacia: #d6cbb0;
  --radio: 0.875rem;

  /* Acá el acento es el verde, así que las personas son la estrella y el lirio. */
  --durazno: #8a5e0e;
  --menta: #a8456a;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--font-lora), Georgia, serif;
  --tipo-titulo: var(--font-amatic), cursive;
  --tipo-cartel: var(--font-amatic), cursive;
  --titulo-peso: 700;
  --titulo-espaciado: 0.04em;
  --borde-ancho: 2px;
  --borde-estilo: dashed;
  --cartel-escala: 1.05;

  --textura:
    url('/textures/acuarela-0c13b8b1dc.svg'),
    url('/textures/acuarela-dbd2d0ecae.svg');
  --textura-tamano: 320px 320px, 180px 180px;

  --sombra-baja: 0 1px 2px rgb(60 50 30 / 0.06), 0 2px 6px rgb(60 50 30 / 0.05);
  --sombra-alta: 0 2px 4px rgb(60 50 30 / 0.06), 0 14px 32px -10px rgb(60 50 30 / 0.26);
}

html.dark[data-tema='acuarela'] {
  /* La misma hoja bajo una lámpara: el grano se aclara en vez de oscurecer. */
  --fondo: #171a14;
  --superficie: #21251c;
  --superficie-alta: #2a2f24;
  --tinta: #f1ecdf;
  --tinta-suave: #b5ae9a;
  --acento: #a4c98a;
  --sobre-acento: #171a14;
  --acento-suave: #2c3824;
  --borde: #323727;
  --estrella-vacia: #40463a;

  --durazno: #efcb6a;
  --menta: #f09bb8;
  --sobre-persona: #171a14;

  --textura:
    url('/textures/acuarela-549aba7a10.svg'),
    url('/textures/acuarela-6cdce03313.svg');
}
`;
