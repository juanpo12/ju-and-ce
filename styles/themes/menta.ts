export default /* css */ `
html[data-tema='menta'] {
  --fondo: #e4f2ea;
  --superficie: #f9fdfb;
  --superficie-alta: #ffffff;
  /* La tinta es el chocolate del granizado, no un gris. */
  --tinta: #2a231d;
  --tinta-suave: #554a41;
  --acento: #17795c;
  --sobre-acento: #ffffff;
  --acento-suave: #cbe8da;
  --borde: #c9e2d4;
  --estrella-vacia: #b4d2c2;
  --radio: 0.875rem;

  /* Acá el segundo color no puede ser menta: se perdería contra el fondo y
     contra el acento. Tampoco cacao, que al lado del durazno se lee como el
     mismo marrón. Pasa a uva, lejos de los dos. */
  --durazno: #b0501d;
  --menta: #6b55b5;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--tipo-texto);
  --tipo-titulo: var(--font-fredoka), sans-serif;
  --tipo-cartel: var(--font-fredoka), sans-serif;
  --titulo-peso: 600;
  --borde-ancho: 2px;
  --cartel-escala: 0.6;

  /* Los chips del granizado. Son elipses con los radios cruzados (unas anchas,
     otras altas): un chip es una escama irregular, y una grilla de puntos
     perfectos se lee como bullet journal, que es justo el otro tema. */
  --chip: #4a2c18;
  --textura:
    radial-gradient(ellipse 3.3px 2.5px at 12% 18%, color-mix(in srgb, var(--chip) 65%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 2px 2.9px at 68% 9%, color-mix(in srgb, var(--chip) 57%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 2.9px 2px at 41% 52%, color-mix(in srgb, var(--chip) 63%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 1.6px 2px at 88% 61%, color-mix(in srgb, var(--chip) 51%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 2.5px 3.3px at 7% 74%, color-mix(in srgb, var(--chip) 60%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 2px 1.6px at 55% 84%, color-mix(in srgb, var(--chip) 48%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 1.6px 2.5px at 31% 33%, color-mix(in srgb, var(--chip) 55%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 2.9px 2px at 93% 27%, color-mix(in srgb, var(--chip) 59%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 2px 2.5px at 77% 44%, color-mix(in srgb, var(--chip) 52%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 2.5px 1.6px at 22% 94%, color-mix(in srgb, var(--chip) 56%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 1.6px 2px at 61% 67%, color-mix(in srgb, var(--chip) 49%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 3.3px 2px at 47% 14%, color-mix(in srgb, var(--chip) 64%, transparent) 0 99%, transparent 0),
    radial-gradient(ellipse 2px 2.9px at 84% 88%, color-mix(in srgb, var(--chip) 53%, transparent) 0 99%, transparent 0);
  --textura-tamano: 130px 130px;

  --sombra-baja: 0 1px 2px rgb(20 50 40 / 0.06), 0 2px 6px rgb(20 50 40 / 0.05);
  --sombra-alta: 0 2px 4px rgb(20 50 40 / 0.06), 0 14px 32px -10px rgb(20 50 40 / 0.25);
}

html.dark[data-tema='menta'] {
  /* Verde bosque: el granizado de noche. */
  --fondo: #111a16;
  --superficie: #1a2621;
  --superficie-alta: #22302a;
  --tinta: #ebf4ef;
  --tinta-suave: #a2b9ae;
  --acento: #5cc79d;
  --sobre-acento: #111a16;
  --acento-suave: #1d3a2f;
  --borde: #2a3b33;
  --estrella-vacia: #33463d;

  --durazno: #f29d66;
  --menta: #b7a8f5;
  --sobre-persona: #111a16;

  /* Sobre verde oscuro, el chip se lee como una sombra: más claro y más tenue. */
  --chip: #3b5a4c;
}
`;
