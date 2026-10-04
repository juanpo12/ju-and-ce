export default /* css */ `
html[data-tema='cacao'] {
  /* Chocolate caliente: crema, cacao y el vapor que sube de la taza. */
  --fondo: #f3e9df;
  --superficie: #fcf6f0;
  --superficie-alta: #ffffff;
  --tinta: #2a1d14;
  --tinta-suave: #5d4b3d;
  --acento: #6b3d1f;
  --sobre-acento: #ffffff;
  --acento-suave: #ecd9c8;
  --borde: #e2d3c3;
  --estrella-vacia: #d2bfab;
  --radio: 1.125rem;

  --durazno: #b2440f;
  --menta: #2d6f5a;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--font-lora), Georgia, serif;
  --tipo-titulo: var(--font-lobster), cursive;
  --tipo-cartel: var(--font-alfa), serif;
  --titulo-peso: 400;
  --borde-ancho: 2px;
  --cartel-escala: 0.62;
  --cartel-mayusculas: none;

  /* Vapor: dos manchas grandes y blandas, flotando. */
  --vapor: #ffffff;
  --textura:
    radial-gradient(ellipse 36% 22% at 20% 18%, color-mix(in srgb, var(--vapor) 55%, transparent), transparent 70%),
    radial-gradient(ellipse 30% 26% at 78% 62%, color-mix(in srgb, var(--vapor) 45%, transparent), transparent 70%);
  --textura-tamano: 100% 100%;
  --textura-repetir: no-repeat;

  --sombra-baja: 0 1px 2px rgb(50 30 15 / 0.06), 0 2px 6px rgb(50 30 15 / 0.05);
  --sombra-alta: 0 2px 4px rgb(50 30 15 / 0.06), 0 14px 32px -10px rgb(50 30 15 / 0.28);
}

html.dark[data-tema='cacao'] {
  /* Chocolate amargo con caramelo. */
  --fondo: #171210;
  --superficie: #221b18;
  --superficie-alta: #2c231f;
  --tinta: #f4ebe3;
  --tinta-suave: #bba89b;
  --acento: #d9a079;
  --sobre-acento: #171210;
  --acento-suave: #3a2a20;
  --borde: #352a25;
  --estrella-vacia: #45382f;

  --durazno: #f08a5b;
  --menta: #80c9b0;
  --sobre-persona: #171210;

  --vapor: #d9a079;
  --textura:
    radial-gradient(ellipse 36% 22% at 20% 18%, color-mix(in srgb, var(--vapor) 10%, transparent), transparent 70%),
    radial-gradient(ellipse 30% 26% at 78% 62%, color-mix(in srgb, var(--vapor) 8%, transparent), transparent 70%);
}
`;
