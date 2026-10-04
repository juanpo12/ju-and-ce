export default /* css */ `
html[data-tema='druidas'] {
  /* El claro del bosque: musgo, bronce y anillos de piedra entrelazados,
     con letra uncial de manuscrito celta. */
  --fondo: #dde5cc;
  --superficie: #f2f6e7;
  --superficie-alta: #f9fbf3;
  --tinta: #182214;
  --tinta-suave: #4d5a44;
  --acento: #6e4a14;
  --sobre-acento: #ffffff;
  --acento-suave: #e4dcc0;
  --borde: #a9b58f;
  --estrella-vacia: #b0bd98;
  --radio: 1.25rem;

  --durazno: #a83a1e;
  --menta: #2f6f8f;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-uncial), Georgia, serif;
  --tipo-cartel: var(--font-uncial), Georgia, serif;
  --tipo-cita: var(--font-fell), Georgia, serif;
  --titulo-peso: 400;
  --borde-ancho: 2px;

  --anillo: #b7c39c;
  --textura:
    radial-gradient(circle at 50% 50%, transparent 24px, var(--anillo) 24px 26px, transparent 26px),
    radial-gradient(circle at 50% 50%, transparent 24px, var(--anillo) 24px 26px, transparent 26px);
  --textura-tamano: 72px 72px;
  --textura-posicion: 0 0, 36px 36px;

  --cartel-escala: 0.54;
  --sombra-baja: 0 1px 2px rgb(30 50 20 / 0.08), 0 2px 6px rgb(30 50 20 / 0.06);
  --sombra-alta: 0 2px 4px rgb(30 50 20 / 0.08), 0 14px 32px -10px rgb(30 50 20 / 0.3);
}

html.dark[data-tema='druidas'] {
  /* El bosque a medianoche, con el bronce brillando. */
  --fondo: #0f1510;
  --superficie: #182018;
  --superficie-alta: #202a20;
  --tinta: #e9efdf;
  --tinta-suave: #a8b59c;
  --acento: #d3a657;
  --sobre-acento: #0f1510;
  --acento-suave: #3a3118;
  --borde: #33432f;
  --estrella-vacia: #36443a;

  --durazno: #f28a66;
  --menta: #80c4e6;
  --sobre-persona: #0f1510;

  --anillo: #1a241a;
}
`;
