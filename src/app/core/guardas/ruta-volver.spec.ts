import { rutaVolverSegura } from './ruta-volver';

describe('rutaVolverSegura (§4.2)', () => {
  it.each(['/grupos', '/grupos/5?pestana=horario', '/estudiantes?search=ana%20mora&page=2', '/'])(
    'acepta la ruta interna %s',
    (ruta) => {
      expect(rutaVolverSegura(ruta)).toBe(ruta);
    },
  );

  it.each([
    ['otro sitio con //', '//otro.sitio/grupos'],
    ['otro sitio con /\\', '/\\otro.sitio'],
    ['una dirección completa', 'https://otro.sitio/grupos'],
    ['javascript:', 'javascript:alert(1)'],
    ['una ruta relativa', 'grupos'],
    ['un texto vacío', ''],
    ['un espacio antes de //', '/ /otro.sitio'],
    ['un tabulador', '/\t/otro.sitio'],
    ['un salto de línea', '/grupos\n'],
  ])('rechaza %s', (_caso, ruta) => {
    expect(rutaVolverSegura(ruta)).toBeNull();
  });

  it.each([null, undefined, 5, ['/grupos']])('rechaza un valor que no es texto: %s', (valor) => {
    expect(rutaVolverSegura(valor)).toBeNull();
  });
});
