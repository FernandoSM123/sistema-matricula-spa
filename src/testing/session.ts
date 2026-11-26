import type { PerfilResponse, TokenResponse } from '../app/api/models';

/** Instante fijo de las pruebas de sesión: 2026-03-05 18:00 UTC. */
export const NOW = Date.UTC(2026, 2, 5, 18, 0, 0);

/** Respuesta del login de un estudiante, con una hora de vigencia desde `NOW`. */
export const ESTUDIANTE_TOKEN: TokenResponse = {
  accessToken: 'token-estudiante',
  expiraEn: '2026-03-05T19:00:00Z',
  rol: 'Estudiante',
  debeCambiarContrasena: false,
};

/** Respuesta del login con una contraseña temporal (RN-24). */
export const PASSWORD_CHANGE_TOKEN: TokenResponse = {
  ...ESTUDIANTE_TOKEN,
  accessToken: 'token-temporal',
  debeCambiarContrasena: true,
};

export const ESTUDIANTE_PROFILE: PerfilResponse = {
  usuarioId: 7,
  personaId: 3,
  correo: 'estudiante1@prueba.test',
  rol: 'Estudiante',
  activo: true,
  fechaCreacion: '2026-01-10T15:00:00Z',
  ultimoIngreso: '2026-03-05T17:59:00Z',
  fechaCambioContrasena: null,
  datosPersonales: {
    cedula: '1-1111-1111',
    nombre: 'María Fernanda',
    apellidos: 'Quesada Rojas',
    telefono: '8888-8888',
    fechaNacimiento: null,
    direccion: null,
    fechaRegistro: '2026-01-10',
    especialidad: null,
    fechaContratacion: null,
  },
};
