// Its own file, without the word list: the anagram screen needs it in the browser.
/** Lowercase and without accents, keeping the ñ: the way the word list is. */
export function normalize(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/(?!̃)[̀-ͯ]/g, '')
    .normalize('NFC');
}
