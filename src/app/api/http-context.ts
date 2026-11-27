import { HttpContextToken } from '@angular/common/http';

/**
 * Marca una petición a la API que no usa la sesión (§4.2): `tokenInterceptor` no le agrega el
 * token y no espera una renovación, y `errorInterceptor` no la trata como una petición con sesión.
 * La lleva `POST /auth/refresh`, que renueva la sesión con el token de acceso ya vencido (RF-60).
 */
export const NO_SESSION = new HttpContextToken<boolean>(() => false);
