export default /* css */ `
html[data-tema='pizarra'] {
  /* La hoja cuadriculada de la escuela, gris pizarra y azul de lapicera. */
  --fondo: #e8ecef;
  --superficie: #f8f9fb;
  --superficie-alta: #ffffff;
  --tinta: #1c2630;
  --tinta-suave: #4e5b68;
  --acento: #2a5d8f;
  --sobre-acento: #ffffff;
  --acento-suave: #d8e4f0;
  --borde: #d3dae0;
  --estrella-vacia: #c2cad2;
  --radio: 0.625rem;

  --durazno: #a0530e;
  --menta: #2f7a5a;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--tipo-texto);
  --tipo-titulo: var(--font-cabin-sketch), cursive;
  --tipo-cartel: var(--font-cabin-sketch), cursive;
  --titulo-peso: 700;
  --borde-ancho: 2px;
  --borde-estilo: dashed;
  --cartel-escala: 0.62;

  --linea: #d9dfe4;
  --textura:
    linear-gradient(var(--linea) 1px, transparent 1px),
    linear-gradient(90deg, var(--linea) 1px, transparent 1px);
  --textura-tamano: 1.5rem 1.5rem;

  --sombra-baja: 0 1px 2px rgb(20 35 50 / 0.06), 0 2px 6px rgb(20 35 50 / 0.05);
  --sombra-alta: 0 2px 4px rgb(20 35 50 / 0.06), 0 14px 32px -10px rgb(20 35 50 / 0.26);
}

html.dark[data-tema='pizarra'] {
  /* De noche la cuadrícula es un pizarrón verde con la tiza marcada. */
  --fondo: #16221d;
  --superficie: #1f2d27;
  --superficie-alta: #283831;
  --tinta: #edf3ef;
  --tinta-suave: #a4b6ac;
  --acento: #8ec9ea;
  --sobre-acento: #16221d;
  --acento-suave: #223a44;
  --borde: #2d3f38;
  --estrella-vacia: #3a4d45;

  --durazno: #f1b765;
  --menta: #8fd3b0;
  --sobre-persona: #16221d;

  --linea: #1c2923;
}
`;
