export default /* css */ `
html[data-tema='frutilla'] {
  /* Frutilla con crema: rosa pálido, rojo frutilla y las semillitas
     desparramadas, en elipses chiquitas como las del granizado. */
  --fondo: #fdeef0;
  --superficie: #fffafa;
  --superficie-alta: #ffffff;
  --tinta: #2d1b20;
  --tinta-suave: #634c53;
  --acento: #c62f66;
  --sobre-acento: #ffffff;
  --acento-suave: #f9d7e2;
  --borde: #f0d8dd;
  --estrella-vacia: #e3c3ca;
  --radio: 1.25rem;

  --durazno: #9b5a08;
  --menta: #2d7360;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--tipo-texto);
  --tipo-titulo: var(--font-baloo), sans-serif;
  --tipo-cartel: var(--font-baloo), sans-serif;
  --titulo-peso: 800;
  --borde-ancho: 2px;
  --cartel-escala: 0.7;

  --semilla: #c6a84a;
  --textura:
    radial-gradient(ellipse 2.4px 3.2px at 14% 22%, color-mix(in srgb, var(--semilla) 60%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 3px 2.2px at 66% 12%, color-mix(in srgb, var(--semilla) 50%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 2.2px 3px at 38% 58%, color-mix(in srgb, var(--semilla) 55%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 3.2px 2.4px at 88% 48%, color-mix(in srgb, var(--semilla) 45%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 2.4px 3px at 10% 80%, color-mix(in srgb, var(--semilla) 52%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 3px 2.2px at 56% 86%, color-mix(in srgb, var(--semilla) 48%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 2.2px 2.8px at 78% 74%, color-mix(in srgb, var(--semilla) 50%, transparent) 0 99%, transparent 0);
  --textura-tamano: 140px 140px;

  --sombra-baja: 0 1px 2px rgb(80 20 40 / 0.06), 0 2px 6px rgb(80 20 40 / 0.05);
  --sombra-alta: 0 2px 4px rgb(80 20 40 / 0.06), 0 14px 32px -10px rgb(80 20 40 / 0.26);
}

html.dark[data-tema='frutilla'] {
  /* Frutilla al chocolate. */
  --fondo: #1a1014;
  --superficie: #26181d;
  --superficie-alta: #301f26;
  --tinta: #f8ecef;
  --tinta-suave: #bfa7ae;
  --acento: #ff85ad;
  --sobre-acento: #1a1014;
  --acento-suave: #45212f;
  --borde: #3a262d;
  --estrella-vacia: #4a333b;

  --durazno: #f0bb63;
  --menta: #85cfb8;
  --sobre-persona: #1a1014;

  --semilla: #5a4a2a;
}
`;
