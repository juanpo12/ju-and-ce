export default /* css */ `
html[data-tema='mostaza'] {
  /* Los setenta: mostaza, oliva y un damero muy tenue de mantel de cocina. */
  --fondo: #f6efd8;
  --superficie: #fdf9ec;
  --superficie-alta: #ffffff;
  --tinta: #2b2416;
  --tinta-suave: #5f5540;
  --acento: #8f5a00;
  --sobre-acento: #ffffff;
  --acento-suave: #f1e2bd;
  --borde: #e5dbbb;
  --estrella-vacia: #d6caa3;
  --radio: 1rem;

  --durazno: #b3401e;
  --menta: #4e6a26;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--tipo-texto);
  --tipo-titulo: var(--font-righteous), sans-serif;
  --tipo-cartel: var(--font-righteous), sans-serif;
  --titulo-peso: 400;
  --titulo-espaciado: 0.02em;
  --borde-ancho: 3px;
  --borde-estilo: double;
  --cartel-escala: 0.66;

  --cuadro: #efe6c6;
  --textura:
    linear-gradient(45deg, var(--cuadro) 25%, transparent 25% 75%, var(--cuadro) 75%),
    linear-gradient(45deg, var(--cuadro) 25%, transparent 25% 75%, var(--cuadro) 75%);
  --textura-tamano: 2.5rem 2.5rem;
  --textura-posicion: 0 0, 1.25rem 1.25rem;

  --sombra-baja: 0 1px 2px rgb(60 45 10 / 0.06), 0 2px 6px rgb(60 45 10 / 0.05);
  --sombra-alta: 0 2px 4px rgb(60 45 10 / 0.06), 0 14px 32px -10px rgb(60 45 10 / 0.26);
}

html.dark[data-tema='mostaza'] {
  --fondo: #1a1610;
  --superficie: #262018;
  --superficie-alta: #302920;
  --tinta: #f5efe0;
  --tinta-suave: #bdb29a;
  --acento: #f0b640;
  --sobre-acento: #1a1610;
  --acento-suave: #3d3018;
  --borde: #3a3226;
  --estrella-vacia: #4a4133;

  --durazno: #f28a68;
  --menta: #a7cc78;
  --sobre-persona: #1a1610;

  --cuadro: #1f1a13;
}
`;
