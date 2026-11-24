import { aParametros } from './paginacion';

describe('aParametros', () => {
  it('quita null, undefined y los textos vacíos o en blanco', () => {
    expect(aParametros({ a: null, b: undefined, c: '', d: '   ', e: 'x' })).toEqual({ e: 'x' });
  });

  it('convierte números y booleanos a texto, incluidos 0 y false', () => {
    expect(aParametros({ page: 2, pageSize: 0, incluirInactivos: true, otro: false })).toEqual({
      page: '2',
      pageSize: '0',
      incluirInactivos: 'true',
      otro: 'false',
    });
  });

  it('recorta los espacios de los extremos de la búsqueda', () => {
    expect(aParametros({ search: '  Ana Mora ' })).toEqual({ search: 'Ana Mora' });
  });

  it('acepta una interfaz de filtros sin firma de índice', () => {
    const filtros: { search?: string; page?: number } = { search: 'ana', page: 1 };
    expect(aParametros(filtros)).toEqual({ search: 'ana', page: '1' });
  });
});
