export default /* css */ `
html[data-tema='taberna'] {
  /* Tablones de roble, cerveza ámbar y una letra tallada a cuchillo. */
  --fondo: #e8d4b5;
  --superficie: #f7ebd8;
  --superficie-alta: #fcf4e6;
  --tinta: #1f1207;
  --tinta-suave: #5f4a33;
  --acento: #84460f;
  --sobre-acento: #ffffff;
  --acento-suave: #ead6b8;
  --borde: #b8976a;
  --estrella-vacia: #c3a57c;
  --radio: 0.375rem;

  --durazno: #a3261c;
  --menta: #2c6b4d;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-sharp), Georgia, serif;
  --tipo-cartel: var(--font-sharp), Georgia, serif;
  --tipo-cita: var(--font-fell), Georgia, serif;
  --titulo-peso: 400;
  --borde-ancho: 2px;

  --veta: #b08a58;
  --textura:
    repeating-linear-gradient(90deg, transparent 0 118px, color-mix(in srgb, var(--veta) 60%, transparent) 118px 121px),
    repeating-linear-gradient(90deg, color-mix(in srgb, var(--veta) 14%, transparent) 0 2px, transparent 2px 9px, color-mix(in srgb, var(--veta) 8%, transparent) 9px 10px, transparent 10px 23px);
  --textura-tamano: 121px 100%, 23px 100%;

  --cartel-escala: 0.65;
  --sombra-baja: 2px 2px 0 var(--borde);
  --sombra-alta: 4px 4px 0 var(--borde);
}

html.dark[data-tema='taberna'] {
  /* La taberna a la noche, con el fuego encendido. */
  --fondo: #1a120b;
  --superficie: #271a10;
  --superficie-alta: #322317;
  --tinta: #f1e4d0;
  --tinta-suave: #c0a98c;
  --acento: #e6a04a;
  --sobre-acento: #1a120b;
  --acento-suave: #4a2f14;
  --borde: #4d3621;
  --estrella-vacia: #4f3a26;

  --durazno: #f07a66;
  --menta: #8ec79f;
  --sobre-persona: #1a120b;

  --veta: #0e0804;
  --sombra-baja: 2px 2px 0 var(--borde);
  --sombra-alta: 4px 4px 0 var(--borde);
}
`;
