import type { ProfileResponse, RefreshTokenRequest, Rol, TokenResponse } from './models';

// Comprueba que los tipos generados siguen la forma que envía la API (COR-03 del backend:
// números como `number` y enums como uniones de textos). Si el contrato cambia, falla la compilación.
describe('models (tipos generados)', () => {
  it('los números son number, no number | string (B-06)', () => {
    expectTypeOf<ProfileResponse['usuarioId']>().toEqualTypeOf<number>();
    expectTypeOf<ProfileResponse['personaId']>().toEqualTypeOf<number | null>();
  });

  it('los enums son uniones de textos, sin null (B-07)', () => {
    expectTypeOf<Rol>().toEqualTypeOf<'Administrador' | 'Profesor' | 'Estudiante'>();
    expectTypeOf<TokenResponse['rol']>().toEqualTypeOf<Rol>();
    expectTypeOf<ProfileResponse['rol']>().toEqualTypeOf<Rol>();
  });

  it('la respuesta con token trae el refresh token, anulable (RF-60, RN-52)', () => {
    expectTypeOf<TokenResponse['refreshToken']>().toEqualTypeOf<string | null>();
    expectTypeOf<TokenResponse['refreshExpiraEn']>().toEqualTypeOf<string | null>();
    expectTypeOf<RefreshTokenRequest>().toEqualTypeOf<{ refreshToken: string }>();
  });
});
