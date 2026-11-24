/**
 * Intl usa espacios que no se parten (U+00A0, U+202F) según el navegador.
 * Las pruebas comparan con espacios normales (docs/arquitectura.md §7.2, §9).
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\u00a0|\u202f/g, ' ');
}
