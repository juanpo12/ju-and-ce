import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    // Sin esto, el primer <Image> con un poster de TMDB tira error en render.
    remotePatterns: [{ protocol: 'https', hostname: 'image.tmdb.org' }],
    // Un póster de TMDB no cambia nunca para la misma ruta: que la versión
    // optimizada viva un mes en vez de las 4 h del default.
    minimumCacheTTL: 2_592_000,
  },
  serverExternalPackages: ['postgres'],
  // Theme textures carry a content hash in their name: if a drawing changes,
  // so does the file. They can be cached forever.
  async headers() {
    return [
      {
        source: '/textures/:file*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
  // El badge flotante de dev tapa la tab bar en mobile.
  devIndicators: false,
};

export default config;
