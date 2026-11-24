/**
 * La ruta de vuelta (`volver`) solo se acepta si es interna: empieza con una sola `/`. Así nadie
 * puede usar el enlace del inicio de sesión para llevar a otro sitio (§4.2). `//otro.sitio` y
 * `/\otro.sitio` los navegadores los leen como otro origen.
 */
export function rutaVolverSegura(valor: unknown): string | null {
  if (typeof valor !== 'string' || !valor.startsWith('/')) return null;
  if (valor.startsWith('//') || valor.startsWith('/\\')) return null;
  // Sin espacios ni caracteres de control, que algunos navegadores ignoran al leer la dirección.
  for (const caracter of valor) {
    const codigo = caracter.charCodeAt(0);
    if (codigo <= 0x20 || codigo === 0x7f) return null;
  }
  return valor;
}
