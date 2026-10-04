import type { Metadata, Viewport } from 'next';
import {
  Alfa_Slab_One,
  Almendra,
  Amatic_SC,
  Anton,
  Audiowide,
  Baloo_2,
  Bangers,
  Bebas_Neue,
  Bungee,
  Bungee_Shade,
  Cabin_Sketch,
  Caveat,
  Caveat_Brush,
  Chakra_Petch,
  Chewy,
  Cinzel,
  Cinzel_Decorative,
  Coiny,
  Comfortaa,
  Cormorant_Garamond,
  Creepster,
  Dancing_Script,
  Figtree,
  Fredoka,
  Great_Vibes,
  Grenze_Gotisch,
  IM_Fell_English,
  Jacquard_12,
  Lilita_One,
  Limelight,
  Lobster,
  Lora,
  Mali,
  MedievalSharp,
  Metal_Mania,
  Metamorphous,
  Monoton,
  New_Rocker,
  Orbitron,
  Oswald,
  Pacifico,
  Patrick_Hand,
  Pirata_One,
  Pixelify_Sans,
  Playfair_Display,
  Press_Start_2P,
  Righteous,
  Rye,
  Shojumaru,
  Silkscreen,
  Sniglet,
  Special_Elite,
  Uncial_Antiqua,
  VT323,
} from 'next/font/google';
import { perfilActual } from '@/lib/sesion';
import { PALETAS, temaValido } from '@/lib/temas';
import { themeCss } from '@/styles/themes';
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

// Una letra por tema para los veinte restantes: cada cuaderno tiene su caligrafía.
// También sin precarga.
const patrick = Patrick_Hand({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-patrick' });
const fredoka = Fredoka({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-fredoka' });
const caveatBrush = Caveat_Brush({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-caveat-brush' });
const oswald = Oswald({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-oswald' });
const cabinSketch = Cabin_Sketch({ subsets: ['latin'], weight: '700', display: 'swap', preload: false, variable: '--font-cabin-sketch' });
const righteous = Righteous({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-righteous' });
const lobster = Lobster({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-lobster' });
const alfa = Alfa_Slab_One({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-alfa' });
const dancing = Dancing_Script({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-dancing' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['600', '700'], display: 'swap', preload: false, variable: '--font-cormorant' });
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-great-vibes' });
const amatic = Amatic_SC({ subsets: ['latin'], weight: '700', display: 'swap', preload: false, variable: '--font-amatic' });
const metamorphous = Metamorphous({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-metamorphous' });
const chewy = Chewy({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-chewy' });
const comfortaa = Comfortaa({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-comfortaa' });
const mali = Mali({ subsets: ['latin'], weight: '700', display: 'swap', preload: false, variable: '--font-mali' });
const limelight = Limelight({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-limelight' });
const anton = Anton({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-anton' });
const bungee = Bungee({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-bungee' });
const pacifico = Pacifico({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-pacifico' });
const playfair = Playfair_Display({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-playfair' });
const baloo = Baloo_2({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-baloo' });
const orbitron = Orbitron({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-orbitron' });

// Fonts for the pixel art, dragon, space, anime and surprise themes. Like the
// others, no preload: each one downloads only with its theme. No Japanese
// fonts: each brings over a hundred @font-face rules, and that CSS everyone pays.
const pressStart = Press_Start_2P({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-press-start' });
const vt323 = VT323({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-vt323' });
const pixelify = Pixelify_Sans({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-pixelify' });
const silkscreen = Silkscreen({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-silkscreen' });
const jacquard = Jacquard_12({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-jacquard' });
const almendra = Almendra({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-almendra' });
const grenze = Grenze_Gotisch({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-grenze' });
const cinzelDeco = Cinzel_Decorative({ subsets: ['latin'], weight: '700', display: 'swap', preload: false, variable: '--font-cinzel-deco' });
const newRocker = New_Rocker({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-new-rocker' });
const metalMania = Metal_Mania({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-metal-mania' });
const audiowide = Audiowide({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-audiowide' });
const chakra = Chakra_Petch({ subsets: ['latin'], weight: ['500', '700'], display: 'swap', preload: false, variable: '--font-chakra' });
const specialElite = Special_Elite({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-special-elite' });
const monoton = Monoton({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-monoton' });
const coiny = Coiny({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-coiny' });
const lilita = Lilita_One({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-lilita' });
const sniglet = Sniglet({ subsets: ['latin'], weight: '800', display: 'swap', preload: false, variable: '--font-sniglet' });
const bungeeShade = Bungee_Shade({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-bungee-shade' });
const shojumaru = Shojumaru({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-shojumaru' });
const bangers = Bangers({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-bangers' });
const creepster = Creepster({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-creepster' });
const rye = Rye({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-rye' });

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
      className={`${caveat.variable} ${bebas.variable} ${figtree.variable} ${lora.variable} ${cinzel.variable} ${fell.variable} ${sharp.variable} ${pirata.variable} ${uncial.variable} ${patrick.variable} ${fredoka.variable} ${caveatBrush.variable} ${oswald.variable} ${cabinSketch.variable} ${righteous.variable} ${lobster.variable} ${alfa.variable} ${dancing.variable} ${cormorant.variable} ${greatVibes.variable} ${amatic.variable} ${metamorphous.variable} ${chewy.variable} ${comfortaa.variable} ${mali.variable} ${limelight.variable} ${anton.variable} ${bungee.variable} ${pacifico.variable} ${playfair.variable} ${baloo.variable} ${orbitron.variable} ${pressStart.variable} ${vt323.variable} ${pixelify.variable} ${silkscreen.variable} ${jacquard.variable} ${almendra.variable} ${grenze.variable} ${cinzelDeco.variable} ${newRocker.variable} ${metalMania.variable} ${audiowide.variable} ${chakra.variable} ${specialElite.variable} ${monoton.variable} ${coiny.variable} ${lilita.variable} ${sniglet.variable} ${bungeeShade.variable} ${shojumaru.variable} ${bangers.variable} ${creepster.variable} ${rye.variable}`}
    >
      <head>
        {/* Only the active theme, inlined: no extra request blocking the first
            paint, and none of the other sixty downloaded. Ajustes fetches the
            one being previewed from `/theme-css`. */}
        <style data-theme-css={tema} dangerouslySetInnerHTML={{ __html: themeCss(tema) }} />
      </head>
      <body className="antialiased">
        <Proveedores tema={tema}>{children}</Proveedores>
      </body>
    </html>
  );
}
