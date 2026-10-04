export default /* css */ `
html[data-tema='bullet'] {
  --fondo: #fbfaf7;
  --superficie: #ffffff;
  --superficie-alta: #ffffff;
  --tinta: #33303d;
  --tinta-suave: #625e70;
  --acento: #6a57b8;
  --sobre-acento: #ffffff;
  --acento-suave: #e6e1f5;
  --borde: #ece9f4;
  --estrella-vacia: #d9d5e6;
  --radio: 1rem;

  --durazno: #b5582f;
  --menta: #2f7e64;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--tipo-texto);
  --tipo-titulo: var(--font-patrick), cursive;
  --tipo-cartel: var(--font-oswald), Impact, sans-serif;
  --titulo-peso: 400;
  --cartel-escala: 0.8;
  --sombra-baja: 0 1px 0 var(--borde);
  --sombra-alta: 0 2px 0 var(--borde), 0 12px 28px -12px rgb(40 30 80 / 0.25);

  /* Grilla de puntos de bullet journal. */
  --linea: #dedae9;
  --textura: radial-gradient(circle at 1px 1px, var(--linea) 1px, transparent 0);
  --textura-tamano: 1.5rem 1.5rem;

  --sombra-baja: 0 1px 2px rgb(40 30 80 / 0.05), 0 2px 6px rgb(40 30 80 / 0.04);
  --sombra-alta: 0 2px 4px rgb(40 30 80 / 0.05), 0 14px 32px -10px rgb(40 30 80 / 0.22);
}

html.dark[data-tema='bullet'] {
  /* Azul noche: la hoja punteada a la luz del proyector. */
  --fondo: #14141d;
  --superficie: #1e1e2b;
  --superficie-alta: #272737;
  --tinta: #eeecf6;
  --tinta-suave: #a9a5bd;
  --acento: #ab9cf0;
  --sobre-acento: #14141d;
  --acento-suave: #2c2848;
  --borde: #2e2d40;
  --estrella-vacia: #3b3a50;

  --durazno: #f2a584;
  --menta: #7ccaae;
  --sobre-persona: #14141d;

  --linea: #252433;

  --sombra-baja: 0 1px 0 var(--borde);
  --sombra-alta: 0 2px 0 var(--borde), 0 16px 36px -12px rgb(0 0 0 / 0.7);
}
`;
