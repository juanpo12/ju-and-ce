export default /* css */ `
html[data-tema='tinta'] {
  /* Tinta china sobre papel de arroz: nada de color, solo negro y crema. El
     acento es la misma tinta un poco más tenue, así un botón sigue siendo un
     botón sin inventar un color que no está en la paleta. */
  --fondo: #f4f3ef;
  --superficie: #fcfbf8;
  --superficie-alta: #ffffff;
  --tinta: #151515;
  --tinta-suave: #555350;
  --acento: #2b2b2b;
  --sobre-acento: #ffffff;
  --acento-suave: #e6e4dd;
  --borde: #dfddd5;
  --estrella-vacia: #cfcdc4;
  --radio: 0.5rem;

  --durazno: #a0561c;
  --menta: #2e6e8e;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--font-lora), Georgia, serif;
  --tipo-titulo: var(--font-caveat-brush), cursive;
  --tipo-cartel: var(--font-oswald), Impact, sans-serif;
  --titulo-peso: 400;
  --borde-ancho: 2px;
  --cartel-escala: 0.8;
  --sombra-baja: 2px 2px 0 var(--borde);
  --sombra-alta: 4px 4px 0 var(--borde);

  /* Trama de pincel en diagonal, apenas. */
  --linea: #e8e6df;
  --textura: repeating-linear-gradient(45deg, transparent 0 11px, var(--linea) 11px 12px);
  --textura-tamano: auto;

  --sombra-baja: 0 1px 2px rgb(0 0 0 / 0.06), 0 2px 6px rgb(0 0 0 / 0.05);
  --sombra-alta: 0 2px 4px rgb(0 0 0 / 0.06), 0 14px 32px -10px rgb(0 0 0 / 0.28);
}

html.dark[data-tema='tinta'] {
  /* El negativo: tinta blanca sobre papel negro. */
  --fondo: #121212;
  --superficie: #1c1c1c;
  --superficie-alta: #262626;
  --tinta: #f1f0ec;
  --tinta-suave: #aaa8a2;
  --acento: #e8e6e0;
  --sobre-acento: #121212;
  --acento-suave: #2e2e2c;
  --borde: #2d2d2d;
  --estrella-vacia: #3b3b3b;

  --durazno: #f0a060;
  --menta: #7cc4e8;
  --sobre-persona: #121212;

  --linea: #191919;

  --sombra-baja: 2px 2px 0 var(--borde);
  --sombra-alta: 4px 4px 0 var(--borde);
}
`;
