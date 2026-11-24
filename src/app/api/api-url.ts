import { InjectionToken } from '@angular/core';

/**
 * URL base de la API (`.../api/v1`). La entrega `app.config.ts` desde `environments/`, y ningún
 * otro archivo la escribe (docs/arquitectura.md §3.1). `tokenInterceptor` solo envía el token a ella.
 */
export const API_URL = new InjectionToken<string>('API_URL');

/** Si la petición va a la API: la URL base exacta o algo debajo de ella, no un prefijo parecido. */
export function isApiUrl(url: string, apiUrl: string): boolean {
  return url === apiUrl || url.startsWith(`${apiUrl}/`) || url.startsWith(`${apiUrl}?`);
}
