import { toParams } from './pagination';

describe('toParams', () => {
  it('quita null, undefined y los textos vacíos o en blanco', () => {
    expect(toParams({ a: null, b: undefined, c: '', d: '   ', e: 'x' })).toEqual({ e: 'x' });
  });

  it('convierte números y booleanos a texto, incluidos 0 y false', () => {
    expect(toParams({ page: 2, pageSize: 0, incluirInactivos: true, otro: false })).toEqual({
      page: '2',
      pageSize: '0',
      incluirInactivos: 'true',
      otro: 'false',
    });
  });

  it('recorta los espacios de los extremos de la búsqueda', () => {
    expect(toParams({ search: '  Ana Mora ' })).toEqual({ search: 'Ana Mora' });
  });

  it('acepta una interfaz de filtros sin firma de índice', () => {
    const filters: { search?: string; page?: number } = { search: 'ana', page: 1 };
    expect(toParams(filters)).toEqual({ search: 'ana', page: '1' });
  });
});
