export default /* css */ `
html[data-tema='pergamino'] {
  /* Un pergamino viejo con manchas de humedad, tinta sepia y lacre rojo. */
  --fondo: #efe2c2;
  --superficie: #f8f0dc;
  --superficie-alta: #fdf7e8;
  --tinta: #2c2013;
  --tinta-suave: #67523a;
  --acento: #8c1c13;
  --sobre-acento: #ffffff;
  --acento-suave: #ecd3c4;
  --borde: #c9b182;
  --estrella-vacia: #c9b58a;
  --radio: 0.25rem;

  --durazno: #7a5410;
  --menta: #2f5d4a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-fell), Georgia, serif;
  --tipo-cartel: var(--font-fell), Georgia, serif;
  --tipo-cita: var(--font-fell), Georgia, serif;
  --titulo-peso: 400;
  --borde-ancho: 3px;
  --borde-estilo: double;

  --mancha: #a8814a;
  --textura:
    radial-gradient(ellipse 34% 26% at 18% 22%, color-mix(in srgb, var(--mancha) 22%, transparent), transparent 70%),
    radial-gradient(ellipse 28% 32% at 82% 68%, color-mix(in srgb, var(--mancha) 18%, transparent), transparent 70%),
    radial-gradient(ellipse 18% 14% at 64% 14%, color-mix(in srgb, var(--mancha) 14%, transparent), transparent 70%),
    radial-gradient(ellipse 22% 18% at 30% 84%, color-mix(in srgb, var(--mancha) 16%, transparent), transparent 70%);
  --textura-tamano: 520px 520px;

  --cartel-escala: 0.56;
  --sombra-baja: 2px 2px 0 var(--borde);
  --sombra-alta: 4px 4px 0 var(--borde);
}

html.dark[data-tema='pergamino'] {
  /* El mismo pergamino, leído a la luz de una vela. */
  --fondo: #1b1510;
  --superficie: #27201a;
  --superficie-alta: #322a22;
  --tinta: #efe3c8;
  --tinta-suave: #bfae8c;
  --acento: #ec7a5e;
  --sobre-acento: #1b1510;
  --acento-suave: #4a2a22;
  --borde: #4d3f2e;
  --estrella-vacia: #4d4133;

  --durazno: #d9a441;
  --menta: #8fbf9f;
  --sobre-persona: #1b1510;

  --mancha: #6b5230;
  --sombra-baja: 2px 2px 0 var(--borde);
  --sombra-alta: 4px 4px 0 var(--borde);
}
`;
