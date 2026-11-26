/**
 * La ruta de vuelta (`volver`) solo se acepta si es interna: empieza con una sola `/`. Así nadie
 * puede usar el enlace del inicio de sesión para llevar a otro sitio (§4.2). `//otro.sitio` y
 * `/\otro.sitio` los navegadores los leen como otro origen.
 */
export function safeReturnUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith('/')) return null;
  if (value.startsWith('//') || value.startsWith('/\\')) return null;
  // Sin espacios ni caracteres de control, que algunos navegadores ignoran al leer la dirección.
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code <= 0x20 || code === 0x7f) return null;
  }
  return value;
}
