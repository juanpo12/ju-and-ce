export default /* css */ `
html[data-tema='galaxia'] {
  /* Un cielo de día lila con estrellas que apenas se adivinan; de noche se
     encienden todas. Puntos de tres tamaños, ninguno más grande que una
     letra, para que no compitan con el texto en una pantalla chica. */
  --fondo: #eceaf7;
  --superficie: #f9f8fe;
  --superficie-alta: #ffffff;
  --tinta: #1f1b33;
  --tinta-suave: #565170;
  --acento: #6a35c9;
  --sobre-acento: #ffffff;
  --acento-suave: #e4daf8;
  --borde: #dcd8ec;
  --estrella-vacia: #c9c4e0;
  --radio: 1rem;

  --durazno: #a4500f;
  --menta: #1f7281;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--font-lora), Georgia, serif;
  --tipo-titulo: var(--font-orbitron), sans-serif;
  --tipo-cartel: var(--font-orbitron), sans-serif;
  --titulo-peso: 700;
  --titulo-espaciado: 0.04em;
  --cartel-escala: 0.5;
  --text-3xl: 1.5rem;
  --text-4xl: 1.875rem;
  --text-5xl: 2.375rem;
  --text-6xl: 3rem;
  --sombra-baja: 0 0 0 1px var(--acento-suave), 0 0 22px -8px var(--acento);
  --sombra-alta: 0 0 0 1px var(--acento-suave), 0 10px 34px -8px var(--acento);

  --estrella: #6a35c9;
  --textura:
    radial-gradient(circle 1.6px at 12% 18%, color-mix(in srgb, var(--estrella) 45%, transparent) 0 99%, transparent 0),
    radial-gradient(circle 1px at 64% 9%, color-mix(in srgb, var(--estrella) 35%, transparent) 0 99%, transparent 0),
    radial-gradient(circle 2px at 41% 52%, color-mix(in srgb, var(--estrella) 40%, transparent) 0 99%, transparent 0),
    radial-gradient(circle 1px at 86% 64%, color-mix(in srgb, var(--estrella) 35%, transparent) 0 99%, transparent 0),
    radial-gradient(circle 1.4px at 8% 81%, color-mix(in srgb, var(--estrella) 40%, transparent) 0 99%, transparent 0),
    radial-gradient(circle 1px at 55% 88%, color-mix(in srgb, var(--estrella) 30%, transparent) 0 99%, transparent 0),
    radial-gradient(circle 1.6px at 29% 36%, color-mix(in srgb, var(--estrella) 35%, transparent) 0 99%, transparent 0),
    radial-gradient(circle 1px at 93% 27%, color-mix(in srgb, var(--estrella) 45%, transparent) 0 99%, transparent 0),
    radial-gradient(circle 1.2px at 74% 45%, color-mix(in srgb, var(--estrella) 30%, transparent) 0 99%, transparent 0),
    radial-gradient(circle 1px at 20% 62%, color-mix(in srgb, var(--estrella) 40%, transparent) 0 99%, transparent 0);
  --textura-tamano: 240px 240px;

  --sombra-baja: 0 1px 2px rgb(40 30 90 / 0.06), 0 2px 6px rgb(40 30 90 / 0.05);
  --sombra-alta: 0 2px 4px rgb(40 30 90 / 0.06), 0 14px 32px -10px rgb(40 30 90 / 0.26);
}

html.dark[data-tema='galaxia'] {
  /* El cielo de verdad: casi negro azulado y las estrellas prendidas. */
  --fondo: #0c0a1a;
  --superficie: #161328;
  --superficie-alta: #1f1b34;
  --tinta: #eeecf8;
  --tinta-suave: #aaa6c6;
  --acento: #b89cff;
  --sobre-acento: #0c0a1a;
  --acento-suave: #2a2149;
  --borde: #2a2642;
  --estrella-vacia: #383354;

  --durazno: #f2ad5f;
  --menta: #74cfdc;
  --sobre-persona: #0c0a1a;

  --estrella: #ffffff;

  --sombra-baja: 0 0 0 1px var(--acento-suave), 0 0 22px -8px var(--acento);
  --sombra-alta: 0 0 0 1px var(--acento-suave), 0 10px 34px -8px var(--acento);
}
`;
