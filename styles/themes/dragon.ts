export default /* css */ `
html[data-tema='dragon'] {
  /* El dragón entre orquídeas: crema durazno, rosa orquídea, y el cielo de
     estrellas rosas de rayos finos, estrellas doradas y una luna. */
  --fondo: #f3e4cf;
  --superficie: #fdf6ec;
  --superficie-alta: #ffffff;
  --tinta: #26211a;
  --tinta-suave: #5e5444;
  --acento: #b0406f;
  --sobre-acento: #ffffff;
  --acento-suave: #f5d8e2;
  --borde: #e6d3b8;
  --estrella-vacia: #dac6a8;
  --radio: 0.75rem;

  /* Oro de las estrellas y el verde del dragón. */
  --durazno: #8a5e0e;
  --menta: #3f6a30;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--font-lora), Georgia, serif;
  --tipo-titulo: var(--font-metamorphous), Georgia, serif;
  --tipo-cartel: var(--font-metamorphous), Georgia, serif;
  --titulo-peso: 400;
  --borde-ancho: 2px;
  --cartel-escala: 0.54;
  --sombra-baja: 2px 2px 0 var(--borde);
  --sombra-alta: 4px 4px 0 var(--borde);

  --textura: url('/textures/dragon-1edb9bb3da.svg');
  --textura-tamano: 340px 340px;

  --sombra-baja: 0 1px 2px rgb(70 45 25 / 0.06), 0 2px 6px rgb(70 45 25 / 0.05);
  --sombra-alta: 0 2px 4px rgb(70 45 25 / 0.06), 0 14px 32px -10px rgb(70 45 25 / 0.28);
}

html.dark[data-tema='dragon'] {
  /* La cueva del dragón: marrón brasa y el cielo que se ve desde la entrada. */
  --fondo: #1a1512;
  --superficie: #251e1a;
  --superficie-alta: #2f2621;
  --tinta: #f5ebdd;
  --tinta-suave: #bbad99;
  --acento: #f39ac0;
  --sobre-acento: #1a1512;
  --acento-suave: #3f2530;
  --borde: #3a2f28;
  --estrella-vacia: #4a3e35;

  --durazno: #eec567;
  --menta: #9fd08a;
  --sobre-persona: #1a1512;

  --textura: url('/textures/dragon-5ba701e258.svg');

  --sombra-baja: 2px 2px 0 var(--borde);
  --sombra-alta: 4px 4px 0 var(--borde);
}
`;
