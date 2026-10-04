export default /* css */ `
html[data-tema='marea'] {
  /* La orilla: celeste de agua clara y azul petróleo, con olas en línea
     cruzando la hoja. El SVG lleva el color adentro: en oscuro se redefine. */
  --fondo: #e5f1f5;
  --superficie: #f9fcfd;
  --superficie-alta: #ffffff;
  --tinta: #1b2a31;
  --tinta-suave: #4b5e67;
  --acento: #0b6f93;
  --sobre-acento: #ffffff;
  --acento-suave: #d0e7ef;
  --borde: #cfe0e7;
  --estrella-vacia: #b9cfd8;
  --radio: 1.25rem;

  --durazno: #a3541a;
  --menta: #4f5fb5;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--tipo-texto);
  --tipo-titulo: var(--font-pacifico), cursive;
  --tipo-cartel: var(--font-pacifico), cursive;
  --titulo-peso: 400;
  --borde-ancho: 2px;
  --cartel-escala: 0.6;
  --cartel-mayusculas: none;

  --textura: url('/textures/marea-c8305b2773.svg');
  --textura-tamano: 120px 40px;

  --sombra-baja: 0 1px 2px rgb(10 50 70 / 0.06), 0 2px 6px rgb(10 50 70 / 0.05);
  --sombra-alta: 0 2px 4px rgb(10 50 70 / 0.06), 0 14px 32px -10px rgb(10 50 70 / 0.26);
}

html.dark[data-tema='marea'] {
  /* Mar de noche, con la espuma apenas iluminada. */
  --fondo: #0b161b;
  --superficie: #142127;
  --superficie-alta: #1c2b32;
  --tinta: #e9f3f6;
  --tinta-suave: #a0b6bf;
  --acento: #67c8e6;
  --sobre-acento: #0b161b;
  --acento-suave: #173640;
  --borde: #233640;
  --estrella-vacia: #30454f;

  --durazno: #f2a46a;
  --menta: #aeb8f5;
  --sobre-persona: #0b161b;

  --textura: url('/textures/marea-16e770cf84.svg');
}
`;
