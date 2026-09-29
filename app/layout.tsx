import type { Metadata, Viewport } from 'next';
import { Caveat, Lora, Quicksand } from 'next/font/google';
import { perfilActual } from '@/lib/sesion';
import '@/styles/temas.css';

// Self-hosted por next/font: no le pedimos nada a Google en runtime.
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat', display: 'swap' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' });
const quicksand = Quicksand({ subsets: ['latin'], variable: '--font-quicksand', display: 'swap' });

export const metadata: Metadata = {
  title: 'Nuestra libreta',
  description: 'Las películas que vimos juntos.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Libreta', statusBarStyle: 'default' },
};

/** El color del fondo de cada tema, para la barra del navegador. */
const COLOR_DE_FONDO: Record<string, string> = {
  papel: '#f5efe1',
  bullet: '#fbfaf7',
  menta: '#e4f2ea',
};

/**
 * Instalada en el inicio del celular, el sistema pinta la barra de estado con
 * este color. Si quedara fijo, el que eligió el tema menta vería una franja
 * beige arriba de su app verde.
 */
export async function generateViewport(): Promise<Viewport> {
  const perfil = await perfilActual();
  return {
    themeColor: COLOR_DE_FONDO[perfil?.tema ?? 'papel'],
    viewportFit: 'cover',
    width: 'device-width',
    initialScale: 1,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // El tema se lee en el servidor y se escribe en el primer render. Aplicarlo con
  // JavaScript después de montar haría ver un flash del tema equivocado.
  const perfil = await perfilActual();

  return (
    // Las clases de next/font van en <html>, no en <body>: definen
    // `--font-caveat` y compañía, y `styles/temas.css` las consume desde
    // `:root`. En <body> quedarían un nivel por debajo y no resolverían — las
    // variables CSS heredan hacia abajo, nunca hacia arriba.
    <html
      lang="es-AR"
      data-tema={perfil?.tema ?? 'papel'}
      className={`${caveat.variable} ${lora.variable} ${quicksand.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
