import type { Metadata, Viewport } from 'next';
import {
  Bebas_Neue,
  Caveat,
  Cinzel,
  Figtree,
  IM_Fell_English,
  Lora,
  MedievalSharp,
  Pirata_One,
  Uncial_Antiqua,
} from 'next/font/google';
import { perfilActual } from '@/lib/sesion';
import { PALETAS, temaValido } from '@/lib/temas';
import { Proveedores } from '@/components/Proveedores';
import '@/styles/temas.css';

// Self-hosted por next/font: no le pedimos nada a Google en runtime.
// Caveat es la letra de la libreta, Bebas la de la marquesina del cine, Figtree
// la que se lee. Lora queda solo para citar comentarios en el tema papel.
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat', display: 'swap' });
const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
  display: 'swap',
});
const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' });
const lora = Lora({
  subsets: ['latin'],
  style: ['italic'],
  variable: '--font-lora',
  display: 'swap',
});

// Las letras de los temas medievales. Sin `preload`: el navegador baja una
// sola cuando el tema la usa, los demás no pagan nada por tenerlas.
// next/font exige literales: no se puede compartir un objeto de opciones.
const cinzel = Cinzel({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-cinzel' });
const fell = IM_Fell_English({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  preload: false,
  variable: '--font-fell',
});
const sharp = MedievalSharp({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  preload: false,
  variable: '--font-sharp',
});
const pirata = Pirata_One({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  preload: false,
  variable: '--font-pirata',
});
const uncial = Uncial_Antiqua({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  preload: false,
  variable: '--font-uncial',
});

export const metadata: Metadata = {
  title: 'Nuestra libreta',
  description: 'Las películas que vimos juntos.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/iconos/icono.svg', apple: '/iconos/icono-192.png' },
  appleWebApp: { capable: true, title: 'Libreta', statusBarStyle: 'default' },
};

/**
 * Instalada en el inicio del celular, el sistema pinta la barra de estado con
 * este color. Va uno por modo: mientras el modo sea «sistema», el navegador
 * elige solo. Si alguien fuerza uno, `ColorDeBarra` lo corrige en el cliente.
 */
export async function generateViewport(): Promise<Viewport> {
  const tema = temaValido((await perfilActual())?.tema);
  return {
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: PALETAS[tema].claro.fondo },
      { media: '(prefers-color-scheme: dark)', color: PALETAS[tema].oscuro.fondo },
    ],
    viewportFit: 'cover',
    width: 'device-width',
    initialScale: 1,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // El tema se lee en el servidor y se escribe en el primer render. Aplicarlo con
  // JavaScript después de montar haría ver un flash del tema equivocado. El modo
  // (claro u oscuro) sí es del navegador: lo pone next-themes con un script que
  // corre antes de pintar, y por eso el `suppressHydrationWarning`.
  const tema = temaValido((await perfilActual())?.tema);

  return (
    // Las clases de next/font van en <html>, no en <body>: definen
    // `--font-caveat` y compañía, y `styles/temas.css` las consume desde
    // `:root`. En <body> quedarían un nivel por debajo y no resolverían — las
    // variables CSS heredan hacia abajo, nunca hacia arriba.
    <html
      lang="es-AR"
      data-tema={tema}
      suppressHydrationWarning
      className={`${caveat.variable} ${bebas.variable} ${figtree.variable} ${lora.variable} ${cinzel.variable} ${fell.variable} ${sharp.variable} ${pirata.variable} ${uncial.variable}`}
    >
      <body className="antialiased">
        <Proveedores tema={tema}>{children}</Proveedores>
      </body>
    </html>
  );
}
