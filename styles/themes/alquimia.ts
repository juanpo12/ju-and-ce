export default /* css */ `
html[data-tema='alquimia'] {
  /* El laboratorio del alquimista: índigo, oro y sigilos de círculos
     concéntricos por detrás. */
  --fondo: #e6e2ee;
  --superficie: #f6f4fa;
  --superficie-alta: #ffffff;
  --tinta: #1c1830;
  --tinta-suave: #514b6b;
  --acento: #7a5600;
  --sobre-acento: #ffffff;
  --acento-suave: #ece2bf;
  --borde: #bdb6d2;
  --estrella-vacia: #bdb6d2;
  --radio: 0.5rem;

  --durazno: #a8381f;
  --menta: #1f6e6e;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-cinzel), Georgia, serif;
  --tipo-cartel: var(--font-cinzel), Georgia, serif;
  --tipo-cita: var(--font-fell), Georgia, serif;
  --titulo-peso: 600;
  --titulo-espaciado: 0.03em;

  --sigilo: #7a5600;
  --textura:
    radial-gradient(circle at 50% 50%, transparent 58px, color-mix(in srgb, var(--sigilo) 18%, transparent) 58px 59px, transparent 59px, transparent 74px, color-mix(in srgb, var(--sigilo) 14%, transparent) 74px 75px, transparent 75px, transparent 96px, color-mix(in srgb, var(--sigilo) 10%, transparent) 96px 97px, transparent 97px),
    radial-gradient(circle 1.5px at 50% 50%, color-mix(in srgb, var(--sigilo) 40%, transparent) 0 99%, transparent 0);
  --textura-tamano: 260px 260px, 52px 52px;

  --cartel-escala: 0.58;
  /* Cinzel en mayúsculas es ancha: los tamaños de Tailwind bajan un escalón
     para que «Interestelar» entre en un celular. */
  --text-3xl: 1.5rem;
  --text-4xl: 1.875rem;
  --text-5xl: 2.375rem;
  --text-6xl: 3rem;
  --sombra-baja: 0 1px 2px rgb(30 20 60 / 0.08), 0 2px 6px rgb(30 20 60 / 0.06);
  --sombra-alta: 0 2px 4px rgb(30 20 60 / 0.08), 0 14px 32px -10px rgb(30 20 60 / 0.3);
}

html.dark[data-tema='alquimia'] {
  /* El laboratorio de noche: los sigilos brillan en oro. */
  --fondo: #0e0b1c;
  --superficie: #191430;
  --superficie-alta: #221b3d;
  --tinta: #ece8f8;
  --tinta-suave: #aaa3c8;
  --acento: #e6c15a;
  --sobre-acento: #0e0b1c;
  --acento-suave: #3a311a;
  --borde: #2f2850;
  --estrella-vacia: #3b3458;

  --durazno: #f0896c;
  --menta: #7ad0d0;
  --sobre-persona: #0e0b1c;

  --sigilo: #e6c15a;
}
`;
