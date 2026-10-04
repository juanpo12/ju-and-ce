export default /* css */ `
html[data-tema='castillo'] {
  /* Muro de piedra, azul real en los estandartes, letras talladas en mayúscula. */
  --fondo: #dcdad3;
  --superficie: #f3f1ec;
  --superficie-alta: #faf9f6;
  --tinta: #1c1d22;
  --tinta-suave: #53555d;
  --acento: #1f4e8c;
  --sobre-acento: #ffffff;
  --acento-suave: #d3deef;
  --borde: #aeaba2;
  --estrella-vacia: #b4b0a6;
  --radio: 0.125rem;

  --durazno: #9a5410;
  --menta: #2d6e5e;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-cinzel), Georgia, serif;
  --tipo-cartel: var(--font-cinzel), Georgia, serif;
  --tipo-cita: var(--font-fell), Georgia, serif;
  --titulo-peso: 700;
  --titulo-mayusculas: uppercase;
  --titulo-espaciado: 0.06em;
  --borde-ancho: 2px;

  --textura: url('/textures/castillo-03e81c44fb.svg');
  --textura-tamano: 120px 60px;

  --cartel-escala: 0.58;
  /* Cinzel en mayúsculas es ancha: los tamaños de Tailwind bajan un escalón
     para que «Interestelar» entre en un celular. */
  --text-3xl: 1.5rem;
  --text-4xl: 1.875rem;
  --text-5xl: 2.375rem;
  --text-6xl: 3rem;
  --sombra-baja: 0 2px 0 var(--borde);
  --sombra-alta: 0 4px 0 var(--borde), 0 14px 32px -10px rgb(20 20 30 / 0.3);
}

html.dark[data-tema='castillo'] {
  /* La torre de noche: piedra oscura y la antorcha azul del estandarte. */
  --fondo: #15171b;
  --superficie: #202329;
  --superficie-alta: #292d34;
  --tinta: #ecebe6;
  --tinta-suave: #aaa9a2;
  --acento: #8db4f0;
  --sobre-acento: #15171b;
  --acento-suave: #223349;
  --borde: #3a3e47;
  --estrella-vacia: #43474f;

  --durazno: #e9b45b;
  --menta: #7ec8b2;
  --sobre-persona: #15171b;

  --textura: url('/textures/castillo-2fcbfd75ff.svg');
  --sombra-baja: 0 2px 0 var(--borde);
  --sombra-alta: 0 4px 0 var(--borde), 0 16px 36px -12px rgb(0 0 0 / 0.7);
}
`;
