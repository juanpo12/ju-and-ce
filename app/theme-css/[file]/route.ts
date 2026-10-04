import { TEMAS } from '@/lib/temas';
import { themeCss } from '@/styles/themes';

/**
 * A theme's CSS, so Ajustes can preview it live without reloading. Normal page
 * loads never come here: the layout already inlines the active theme.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return TEMAS.filter((t) => t !== 'papel').map((t) => ({ file: `${t}.css` }));
}

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const theme = TEMAS.find((t) => `${t}.css` === file);
  if (!theme) return new Response('Not found', { status: 404 });
  return new Response(themeCss(theme), {
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      // Only changes with a deploy: cache for a while, then revalidate.
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
