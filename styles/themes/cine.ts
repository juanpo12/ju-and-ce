export default /* css */ `
html[data-tema='cine'] {
  /* La sala: crema de pochoclo y el rojo del telón, con sus pliegues apenas
     marcados de lado a lado. */
  --fondo: #f8f0e4;
  --superficie: #fffaf2;
  --superficie-alta: #ffffff;
  --tinta: #2a1a1b;
  --tinta-suave: #5e4a4c;
  --acento: #b3202c;
  --sobre-acento: #ffffff;
  --acento-suave: #f5d9d6;
  --borde: #e8dccb;
  --estrella-vacia: #d8c9b4;
  --radio: 0.75rem;

  --durazno: #8a5a0a;
  --menta: #2f6b6a;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--font-lora), Georgia, serif;
  --tipo-titulo: var(--font-limelight), cursive;
  --tipo-cartel: var(--font-anton), Impact, sans-serif;
  --titulo-peso: 400;
  --titulo-espaciado: 0.03em;
  --borde-ancho: 3px;
  --borde-estilo: double;
  --cartel-escala: 0.95;
  --text-3xl: 1.5rem;
  --text-4xl: 1.875rem;
  --text-5xl: 2.375rem;
  --text-6xl: 3rem;

  --pliegue: #b3202c;
  --textura: repeating-linear-gradient(
    90deg,
    transparent 0,
    color-mix(in srgb, var(--pliegue) 5%, transparent) 26px,
    transparent 52px
  );
  --textura-tamano: auto;

  --sombra-baja: 0 1px 2px rgb(60 20 25 / 0.06), 0 2px 6px rgb(60 20 25 / 0.05);
  --sombra-alta: 0 2px 4px rgb(60 20 25 / 0.06), 0 14px 32px -10px rgb(60 20 25 / 0.28);
}

html.dark[data-tema='cine'] {
  /* Las luces se apagan: el telón queda en penumbra y el rojo se enciende. */
  --fondo: #140d0e;
  --superficie: #201517;
  --superficie-alta: #2a1c1f;
  --tinta: #f6ebe6;
  --tinta-suave: #bda7a3;
  --acento: #f26b76;
  --sobre-acento: #140d0e;
  --acento-suave: #3e1f24;
  --borde: #362326;
  --estrella-vacia: #463034;

  --durazno: #e9bb5e;
  --menta: #7ccbc5;
  --sobre-persona: #140d0e;

  --pliegue: #f26b76;
}
`;
