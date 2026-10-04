export default /* css */ `
html[data-tema='heraldica'] {
  /* El escudo: gules y oro en escaques, borde negro de xilografía y letra
     gótica de estandarte. Nada redondeado. */
  --fondo: #efe3cb;
  --superficie: #fbf5e6;
  --superficie-alta: #ffffff;
  --tinta: #2a1414;
  --tinta-suave: #5f3d3d;
  --acento: #a01818;
  --sobre-acento: #ffffff;
  --acento-suave: #f2d2cc;
  --borde: #2a1414;
  --estrella-vacia: #cdb989;
  --radio: 0;

  --durazno: #7a5700;
  --menta: #1f4f8a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-pirata), Georgia, serif;
  --tipo-cartel: var(--font-pirata), Georgia, serif;
  --tipo-cita: var(--font-fell), Georgia, serif;
  --titulo-peso: 400;
  --titulo-espaciado: 0.02em;
  --borde-ancho: 2px;

  --escaque: #e3d2a8;
  --textura:
    linear-gradient(45deg, var(--escaque) 25%, transparent 25% 75%, var(--escaque) 75%),
    linear-gradient(45deg, var(--escaque) 25%, transparent 25% 75%, var(--escaque) 75%);
  --textura-tamano: 72px 72px;
  --textura-posicion: 0 0, 36px 36px;

  --cartel-escala: 0.78;
  --sombra-baja: 3px 3px 0 var(--borde);
  --sombra-alta: 5px 5px 0 var(--borde);
}

html.dark[data-tema='heraldica'] {
  /* El escudo colgado en la sala oscura. */
  --fondo: #170f0f;
  --superficie: #241515;
  --superficie-alta: #2f1c1c;
  --tinta: #f5e9dc;
  --tinta-suave: #c3a79c;
  --acento: #ff7070;
  --sobre-acento: #170f0f;
  --acento-suave: #4a1f1f;
  --borde: #5a3a3a;
  --estrella-vacia: #4a3030;

  --durazno: #e8c25a;
  --menta: #86b6f2;
  --sobre-persona: #170f0f;

  --escaque: #1f1414;
  --sombra-baja: 3px 3px 0 var(--borde);
  --sombra-alta: 5px 5px 0 var(--borde);
}
`;
