export default /* css */ `
html[data-tema='vitral'] {
  /* El vitral de la catedral: marfil, plomo en rombos y los paños de color
     asomando apenas. El rubí es el acento. */
  --fondo: #f0e9dc;
  --superficie: #faf6ee;
  --superficie-alta: #ffffff;
  --tinta: #231a2a;
  --tinta-suave: #574a5f;
  --acento: #a3153c;
  --sobre-acento: #ffffff;
  --acento-suave: #f3d3dc;
  --borde: #c9bca8;
  --estrella-vacia: #d2c6b2;
  --radio: 0.375rem;

  --durazno: #8a5a00;
  --menta: #1f5f8a;
  --sobre-persona: #ffffff;

  --tipo-titulo: var(--font-cinzel), Georgia, serif;
  --tipo-cartel: var(--font-cinzel), Georgia, serif;
  --tipo-cita: var(--font-fell), Georgia, serif;
  --titulo-peso: 600;
  --titulo-mayusculas: uppercase;
  --titulo-espaciado: 0.04em;
  --borde-ancho: 3px;
  --borde-estilo: double;

  --plomo: #b9ad99;
  --textura:
    repeating-linear-gradient(45deg, transparent 0 42px, color-mix(in srgb, var(--plomo) 70%, transparent) 42px 44px),
    repeating-linear-gradient(-45deg, transparent 0 42px, color-mix(in srgb, var(--plomo) 70%, transparent) 42px 44px),
    radial-gradient(circle 60px at 20% 30%, rgb(163 21 60 / 0.07), transparent 100%),
    radial-gradient(circle 70px at 75% 70%, rgb(31 95 138 / 0.08), transparent 100%),
    radial-gradient(circle 50px at 80% 15%, rgb(138 90 0 / 0.08), transparent 100%),
    radial-gradient(circle 55px at 25% 85%, rgb(47 109 74 / 0.07), transparent 100%);
  --textura-tamano: 62px 62px, 62px 62px, 372px 372px, 372px 372px, 372px 372px, 372px 372px;

  --cartel-escala: 0.58;
  /* Cinzel en mayúsculas es ancha: los tamaños de Tailwind bajan un escalón
     para que «Interestelar» entre en un celular. */
  --text-3xl: 1.5rem;
  --text-4xl: 1.875rem;
  --text-5xl: 2.375rem;
  --text-6xl: 3rem;
  --sombra-baja: 0 1px 2px rgb(40 20 50 / 0.08), 0 2px 6px rgb(40 20 50 / 0.06);
  --sombra-alta: 0 2px 4px rgb(40 20 50 / 0.08), 0 14px 32px -10px rgb(40 20 50 / 0.3);
}

html.dark[data-tema='vitral'] {
  /* La catedral de noche: el vitral se enciende desde adentro. */
  --fondo: #120d18;
  --superficie: #1d1626;
  --superficie-alta: #271e32;
  --tinta: #f3eaf5;
  --tinta-suave: #b9a9bf;
  --acento: #ff7a9c;
  --sobre-acento: #120d18;
  --acento-suave: #45202e;
  --borde: #3d3148;
  --estrella-vacia: #463a52;

  --durazno: #f0c15a;
  --menta: #7fc2f0;
  --sobre-persona: #120d18;

  --plomo: #060409;
  --textura:
    repeating-linear-gradient(45deg, transparent 0 42px, var(--plomo) 42px 44px),
    repeating-linear-gradient(-45deg, transparent 0 42px, var(--plomo) 42px 44px),
    radial-gradient(circle 60px at 20% 30%, rgb(255 122 156 / 0.12), transparent 100%),
    radial-gradient(circle 70px at 75% 70%, rgb(127 194 240 / 0.12), transparent 100%),
    radial-gradient(circle 50px at 80% 15%, rgb(240 193 90 / 0.12), transparent 100%),
    radial-gradient(circle 55px at 25% 85%, rgb(120 200 150 / 0.1), transparent 100%);
}
`;
