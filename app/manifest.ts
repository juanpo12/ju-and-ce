import type { MetadataRoute } from 'next';

/**
 * Con esto los dos pueden agregarla al inicio del celular: queda con ícono
 * propio y sin barra del navegador. Desde afuera no se distingue de una app
 * instalada, y no hay tienda, ni revisión, ni nada que caduque.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nuestra libreta',
    short_name: 'Libreta',
    description: 'Las películas que vimos juntos.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f5efe1',
    theme_color: '#f5efe1',
    lang: 'es-AR',
    icons: [
      { src: '/iconos/icono-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/iconos/icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/iconos/icono-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
