'use client';

import { useEffect } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import { MotionConfig } from 'motion/react';
import { Toaster } from '@/components/ui/sonner';
import { PALETAS, type Tema } from '@/lib/temas';

/**
 * Lo que tiene que envolver a toda la app del lado del cliente.
 *
 * - next-themes pone `.dark` en el <html> antes de pintar, con un script en
 *   línea: por eso el <html> lleva `suppressHydrationWarning`. El tema (papel,
 *   bullet, menta, las de hadas) no pasa por acá, lo escribe el servidor.
 * - `reducedMotion="user"`: con `prefers-reduced-motion`, Motion deja las
 *   opacidades y se saltea los movimientos. El CSS hace lo mismo con el resto.
 */
export function Proveedores({ tema, children }: { tema: Tema; children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      // El script antiflash ya corrió desde el HTML del servidor. Si en el
      // cliente sigue siendo JavaScript, React 19 avisa que un <script> dentro
      // de un componente nunca se ejecuta; con otro `type` es solo un nodo más.
      scriptProps={typeof window === 'undefined' ? undefined : { type: 'application/json' }}
    >
      <MotionConfig reducedMotion="user">
        {children}
        <ColorDeBarra tema={tema} />
        <Toaster position="top-center" />
      </MotionConfig>
    </ThemeProvider>
  );
}

/**
 * El servidor manda dos `theme-color`, uno por `prefers-color-scheme`, y con eso
 * alcanza mientras el modo sea «sistema». Si alguien fuerza oscuro con el
 * celular en claro, el navegador seguiría pintando la barra clara: esto la
 * corrige con el modo que de verdad se ve.
 */
function ColorDeBarra({ tema }: { tema: Tema }) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;
    const color = PALETAS[tema][resolvedTheme === 'dark' ? 'oscuro' : 'claro'].fondo;
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => (meta.content = color));
  }, [tema, resolvedTheme]);

  return null;
}
