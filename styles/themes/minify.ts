/** Without comments or extra whitespace: what travels inside the HTML. */
export function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,])\s*/g, '$1')
    .replace(/(--[\w-]+):\s+/g, '$1:')
    .trim();
}
