export default /* css */ `
html[data-tema='pradera'] {
  /* El pasto a contraluz: verde casi blanco, flores rosas y brillos que flotan
     desenfocados. Por eso el bokeh es de círculos que se desvanecen, no
     puntos con borde. */
  --fondo: #eff5e9;
  --superficie: #fbfdf8;
  --superficie-alta: #ffffff;
  --tinta: #26301f;
  --tinta-suave: #4f5c45;
  --acento: #b03f63;
  --sobre-acento: #ffffff;
  --acento-suave: #f5dbe3;
  --borde: #d8e5cf;
  --estrella-vacia: #c7d8bc;
  --radio: 1.25rem;

  /* El segundo color es el celeste de los destellos: el verde se perdería en
     el fondo y otro rosa, contra el acento. */
  --durazno: #8a5a0c;
  --menta: #3b62a8;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--tipo-texto);
  --tipo-titulo: var(--font-great-vibes), cursive;
  --tipo-cartel: var(--font-cormorant), Georgia, serif;
  --titulo-peso: 400;
  --cartel-escala: 0.66;

  --brillo-dorado: #e8c35a;
  --brillo-rosa: #f0a3b8;
  --brillo-blanco: #ffffff;
  --brillo-celeste: #a9c4f2;
  --textura:
    radial-gradient(circle 9px at 12% 18%, color-mix(in srgb, var(--brillo-dorado) 35%, transparent) 0, transparent 100%),
    radial-gradient(circle 5px at 64% 9%, color-mix(in srgb, var(--brillo-rosa) 50%, transparent) 0, transparent 100%),
    radial-gradient(circle 11px at 41% 52%, color-mix(in srgb, var(--brillo-blanco) 55%, transparent) 0, transparent 100%),
    radial-gradient(circle 6px at 86% 64%, color-mix(in srgb, var(--brillo-celeste) 40%, transparent) 0, transparent 100%),
    radial-gradient(circle 7px at 8% 81%, color-mix(in srgb, var(--brillo-rosa) 45%, transparent) 0, transparent 100%),
    radial-gradient(circle 10px at 55% 88%, color-mix(in srgb, var(--brillo-dorado) 30%, transparent) 0, transparent 100%),
    radial-gradient(circle 3px at 29% 36%, color-mix(in srgb, var(--brillo-blanco) 80%, transparent) 0, transparent 100%),
    radial-gradient(circle 4px at 93% 27%, color-mix(in srgb, var(--brillo-dorado) 60%, transparent) 0, transparent 100%),
    radial-gradient(circle 8px at 74% 45%, color-mix(in srgb, var(--brillo-rosa) 35%, transparent) 0, transparent 100%),
    radial-gradient(circle 2.5px at 20% 62%, color-mix(in srgb, var(--brillo-celeste) 70%, transparent) 0, transparent 100%),
    radial-gradient(circle 2px at 47% 15%, color-mix(in srgb, var(--brillo-dorado) 80%, transparent) 0, transparent 100%),
    radial-gradient(circle 3px at 68% 78%, color-mix(in srgb, var(--brillo-blanco) 70%, transparent) 0, transparent 100%);
  --textura-tamano: 260px 260px;

  --sombra-baja: 0 1px 2px rgb(40 60 30 / 0.05), 0 2px 6px rgb(40 60 30 / 0.04);
  --sombra-alta: 0 2px 4px rgb(40 60 30 / 0.05), 0 14px 32px -10px rgb(40 60 30 / 0.22);
}

html.dark[data-tema='pradera'] {
  /* La pradera al anochecer: los brillos se vuelven luciérnagas. */
  --fondo: #121812;
  --superficie: #1b231b;
  --superficie-alta: #243024;
  --tinta: #eef5ea;
  --tinta-suave: #a9b8a3;
  --acento: #f29bb6;
  --sobre-acento: #121812;
  --acento-suave: #3a2330;
  --borde: #29352a;
  --estrella-vacia: #364436;

  --durazno: #efc26b;
  --menta: #9db8f2;
  --sobre-persona: #121812;

  --brillo-dorado: #a8893a;
  --brillo-rosa: #8e4a60;
  --brillo-blanco: #5d6b58;
  --brillo-celeste: #4d6394;
}
`;
