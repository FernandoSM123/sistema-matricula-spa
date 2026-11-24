import type { PerfilResponse, Rol, TokenResponse } from './models';

// Comprueba que los tipos generados siguen la forma que envía la API (COR-03 del backend:
// números como `number` y enums como uniones de textos). Si el contrato cambia, falla la compilación.
describe('models (tipos generados)', () => {
  it('los números son number, no number | string (B-06)', () => {
    expectTypeOf<PerfilResponse['usuarioId']>().toEqualTypeOf<number>();
    expectTypeOf<PerfilResponse['personaId']>().toEqualTypeOf<number | null>();
  });

  it('los enums son uniones de textos, sin null (B-07)', () => {
    expectTypeOf<Rol>().toEqualTypeOf<'Administrador' | 'Profesor' | 'Estudiante'>();
    expectTypeOf<TokenResponse['rol']>().toEqualTypeOf<Rol>();
    expectTypeOf<PerfilResponse['rol']>().toEqualTypeOf<Rol>();
  });
});
