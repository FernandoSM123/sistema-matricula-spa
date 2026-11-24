// Nombres legibles de los tipos generados (docs/arquitectura.md §3.2). El resto del SPA importa de
// aquí, nunca de esquema.d.ts. Cada módulo agrega los alias que usa.
import type { components } from './esquema';

type Esquemas = components['schemas'];

export type Rol = Esquemas['Rol'];

/** Respuesta con token: login, cambio obligatorio y cambiar contraseña (§4.1). */
export type TokenResponse = Esquemas['TokenResponse'];

/** `GET /me`. */
export type PerfilResponse = Esquemas['PerfilResponse'];
export type DatosPersonalesResponse = Esquemas['DatosPersonalesResponse'];

/** Cuerpo de los errores de la API. Su forma interpretada es `ErrorApi` (§3.5). */
export type ProblemDetails = Esquemas['ProblemDetails'];
export type ValidationProblemDetails = Esquemas['ValidationProblemDetails'];
