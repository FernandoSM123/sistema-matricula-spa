// Nombres legibles de los tipos generados (docs/arquitectura.md §3.2). El resto del SPA importa de
// aquí, nunca de schema.d.ts. Cada módulo agrega los alias que usa.
import type { components } from './schema';

type Esquemas = components['schemas'];

export type Rol = Esquemas['Rol'];

/**
 * Respuesta con token: login, cambio obligatorio, cambiar contraseña y renovación (§4.1).
 * `refreshToken` y `refreshExpiraEn` son `null` en el login con una temporal (RN-52).
 */
export type TokenResponse = Esquemas['TokenResponse'];

/** Cuerpo de `POST /auth/refresh` (RF-60). */
export type RefreshTokenRequest = Esquemas['RefreshTokenRequest'];

/** `GET /me`. */
export type ProfileResponse = Esquemas['ProfileResponse'];
export type DatosPersonalesResponse = Esquemas['DatosPersonalesResponse'];

/** Cuerpo de los errores de la API. Su forma interpretada es `ApiError` (§3.5). */
export type ProblemDetails = Esquemas['ProblemDetails'];
export type ValidationProblemDetails = Esquemas['ValidationProblemDetails'];
