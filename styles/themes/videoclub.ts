export default /* css */ `
html[data-tema='videoclub'] {
  /* El videoclub del barrio: gris de carátula y magenta de VHS, con las líneas
     de la tele de tubo cruzando la hoja. */
  --fondo: #eef0f5;
  --superficie: #fafbfe;
  --superficie-alta: #ffffff;
  --tinta: #1e2030;
  --tinta-suave: #555a70;
  --acento: #c2187a;
  --sobre-acento: #ffffff;
  --acento-suave: #f6d7e9;
  --borde: #dcdfe8;
  --estrella-vacia: #c9cdd9;
  --radio: 0.5rem;

  --durazno: #9a5200;
  --menta: #1f6f8f;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--tipo-texto);
  --tipo-titulo: var(--font-bungee), sans-serif;
  --tipo-cartel: var(--font-bungee), sans-serif;
  --titulo-peso: 400;
  --borde-ancho: 2px;
  --cartel-escala: 0.46;
  --text-3xl: 1.5rem;
  --text-4xl: 1.875rem;
  --text-5xl: 2.375rem;
  --text-6xl: 3rem;
  --sombra-baja: 3px 3px 0 var(--acento);
  --sombra-alta: 5px 5px 0 var(--acento);

  --linea: #e3e6ee;
  --textura: repeating-linear-gradient(to bottom, transparent 0 3px, var(--linea) 3px 4px);
  --textura-tamano: auto;

  --sombra-baja: 0 1px 2px rgb(30 32 60 / 0.06), 0 2px 6px rgb(30 32 60 / 0.05);
  --sombra-alta: 0 2px 4px rgb(30 32 60 / 0.06), 0 14px 32px -10px rgb(30 32 60 / 0.26);
}

html.dark[data-tema='videoclub'] {
  /* El neón de la vidriera a la noche. */
  --fondo: #0f1119;
  --superficie: #191b26;
  --superficie-alta: #222433;
  --tinta: #eceef8;
  --tinta-suave: #a7abc2;
  --acento: #ff6fc0;
  --sobre-acento: #0f1119;
  --acento-suave: #3a1f35;
  --borde: #2a2d3d;
  --estrella-vacia: #383b4d;

  --durazno: #f5b457;
  --menta: #6ccbe8;
  --sobre-persona: #0f1119;

  --linea: #13151f;

  --sombra-baja: 3px 3px 0 var(--acento);
  --sombra-alta: 5px 5px 0 var(--acento);
}
`;
