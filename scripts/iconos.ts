/**
 * Genera los PNG del manifest desde un SVG, para no versionar binarios que nadie
 * puede revisar en un diff.
 *
 *   npm run iconos
 *
 * El maskable lleva la estrella más chica: Android recorta el ícono a la forma
 * del launcher y se come cerca de un 10% de cada borde.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const FONDO = '#f5efe1';
const ACENTO = '#c2562f';
const TINTA = '#2b2620';

function svg({ escala, redondeado }: { escala: number; redondeado: boolean }) {
  const r = redondeado ? 96 : 0;
  const centro = 256;
  const s = escala;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${r}" fill="${FONDO}"/>
  <g transform="translate(${centro} ${centro}) scale(${s}) translate(-${centro} -${centro})">
    <rect x="136" y="96" width="240" height="320" rx="20" fill="#fffcf4" stroke="${TINTA}" stroke-width="12"/>
    <path d="M196 96v320" stroke="${TINTA}" stroke-width="12" stroke-linecap="round"/>
    <path d="M286 176l26 53 58 8.5-42 41 10 58-52-27.5-52 27.5 10-58-42-41 58-8.5z" fill="${ACENTO}"/>
  </g>
</svg>`;
}

await mkdir('public/iconos', { recursive: true });

const variantes = [
  { archivo: 'icono-192.png', tamano: 192, escala: 1, redondeado: true },
  { archivo: 'icono-512.png', tamano: 512, escala: 1, redondeado: true },
  { archivo: 'icono-maskable.png', tamano: 512, escala: 0.72, redondeado: false },
];

for (const { archivo, tamano, escala, redondeado } of variantes) {
  const png = await sharp(Buffer.from(svg({ escala, redondeado })))
    .resize(tamano, tamano)
    .png()
    .toBuffer();
  await writeFile(`public/iconos/${archivo}`, png);
  console.log(`  public/iconos/${archivo}  ${tamano}×${tamano}`);
}

// El favicon del navegador, del mismo dibujo.
await writeFile('public/iconos/icono.svg', svg({ escala: 1, redondeado: false }));
console.log('  public/iconos/icono.svg');
