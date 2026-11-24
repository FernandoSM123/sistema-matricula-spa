import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL, isApiUrl } from '../../api/api-url';
import { toApiError } from '../../api/api-error';
import { SessionService } from '../session/session-service';

/** Tiempo de espera de las peticiones a la API. Si se agota, cuenta como sin respuesta (§3.1, RUI-03). */
export const REQUEST_TIMEOUT = 30_000;

/**
 * Convierte los errores de la API en `ApiError` (§3.5) y maneja los dos que cambian de vista:
 * el `401` de una petición con token (RFF-03) y el `403 RN-24` (RFF-02). Los demás siguen hasta
 * el componente, que los presenta junto a la acción o en la vista (RUI-01).
 *
 * Debe ir después de `tokenInterceptor`, para ver el encabezado `Authorization`.
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  if (!isApiUrl(request.url, inject(API_URL))) {
    return next(request); // Íconos y otros archivos del sitio: no son errores de la API.
  }
  const session = inject(SessionService);
  const router = inject(Router);
  const withTimeout = request.timeout ? request : request.clone({ timeout: REQUEST_TIMEOUT });

  return next(withTimeout).pipe(
    catchError((response: unknown) => {
      const error = toApiError(response);
      // Solo con token y si la sesión sigue: así un 401 sin token (login) lo maneja V-02, el del
      // logout no navega (la sesión ya se descartó) y de varios 401 a la vez navega el primero.
      if (error.status === 401 && request.headers.has('Authorization') && session.token() !== null) {
        const volver = router.url;
        session.end();
        void router.navigate(['/iniciar-sesion'], { queryParams: { volver, aviso: 'sesion-terminada' } });
      } else if (error.status === 403 && error.code === 'RN-24') {
        void router.navigate(['/cambio-obligatorio']);
      }
      return throwError(() => error);
    }),
  );
};
