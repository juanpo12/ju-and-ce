import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    // Sin esto, el primer <Image> con un poster de TMDB tira error en render.
    remotePatterns: [{ protocol: 'https', hostname: 'image.tmdb.org' }],
  },
  serverExternalPackages: ['postgres'],
  // El badge flotante de dev tapa la tab bar en mobile.
  devIndicators: false,
};

export default config;
