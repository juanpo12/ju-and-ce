export default /* css */ `
html[data-tema='atardecer'] {
  /* El cielo cuando baja el sol: durazno abajo, lila arriba, y el sol todavía
     asomando por el borde de la pantalla. Es una sola luz, no se repite:
     en el celular queda arriba del todo, como corresponde. */
  --fondo: #f9e9e0;
  --superficie: #fff8f3;
  --superficie-alta: #ffffff;
  --tinta: #2d1f2a;
  --tinta-suave: #604e5c;
  --acento: #8b3a7e;
  --sobre-acento: #ffffff;
  --acento-suave: #f0d9ec;
  --borde: #ecd9d0;
  --estrella-vacia: #dcc6bc;
  --radio: 1.5rem;

  --durazno: #a24d12;
  --menta: #2f6f7a;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--font-lora), Georgia, serif;
  --tipo-titulo: var(--font-playfair), Georgia, serif;
  --tipo-cartel: var(--font-playfair), Georgia, serif;
  --titulo-peso: 800;
  --cartel-escala: 0.62;

  --sol: #ffb37a;
  --cielo: #c9a3d6;
  --textura:
    radial-gradient(90% 40% at 50% -8%, color-mix(in srgb, var(--sol) 70%, transparent), transparent 70%),
    linear-gradient(to bottom, color-mix(in srgb, var(--cielo) 30%, transparent), transparent 45%);
  --textura-tamano: 100% 100%;
  --textura-repetir: no-repeat;

  --sombra-baja: 0 1px 2px rgb(70 30 50 / 0.06), 0 2px 6px rgb(70 30 50 / 0.05);
  --sombra-alta: 0 2px 4px rgb(70 30 50 / 0.06), 0 14px 32px -10px rgb(70 30 50 / 0.26);
}

html.dark[data-tema='atardecer'] {
  /* Ya se fue el sol: queda el resplandor violeta y una luna lila. */
  --fondo: #1b1220;
  --superficie: #261a2c;
  --superficie-alta: #312337;
  --tinta: #f5ebf2;
  --tinta-suave: #b9a7b5;
  --acento: #e39ad8;
  --sobre-acento: #1b1220;
  --acento-suave: #3e2541;
  --borde: #3a2a3e;
  --estrella-vacia: #4a3850;

  --durazno: #f5a16e;
  --menta: #7fcbd6;
  --sobre-persona: #1b1220;

  --sol: #e39ad8;
  --cielo: #f5a16e;
  --textura:
    radial-gradient(90% 40% at 50% -8%, color-mix(in srgb, var(--sol) 22%, transparent), transparent 70%),
    linear-gradient(to bottom, color-mix(in srgb, var(--cielo) 8%, transparent), transparent 45%);
}
`;
