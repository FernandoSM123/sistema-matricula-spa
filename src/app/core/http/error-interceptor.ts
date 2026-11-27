import {
  HttpContext,
  HttpContextToken,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, defer, Observable, switchMap, throwError } from 'rxjs';
import { API_URL, isApiUrl } from '../../api/api-url';
import { toApiError } from '../../api/api-error';
import { NO_SESSION } from '../../api/http-context';
import { SessionService } from '../session/session-service';

/** Tiempo de espera de las peticiones a la API. Si se agota, cuenta como sin respuesta (§3.1, RUI-03). */
export const REQUEST_TIMEOUT = 30_000;

/** La petición ya se repitió una vez tras renovar: otro `401` es RFF-03, sin renovar de nuevo. */
const RETRIED = new HttpContextToken<boolean>(() => false);

/**
 * Convierte los errores de la API en `ApiError` (§3.5) y maneja los que cambian de vista:
 * - `401` de una petición con token: renueva la sesión (RF-60) y repite la petición una vez. Si la
 *   sesión ya no se puede renovar, RFF-03. Si la renovación no está disponible (sin respuesta,
 *   `429`, `5xx`), la petición falla con ese error y la sesión sigue.
 * - `403 RN-24`: abre `V-03` (RFF-02).
 * Los demás siguen hasta el componente, que los presenta junto a la acción o en la vista (RUI-01).
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
  return handle(withTimeout, next, session, router);
};

function handle(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  session: SessionService,
  router: Router,
): Observable<HttpEvent<unknown>> {
  return next(request).pipe(
    catchError((response: unknown) => {
      const error = toApiError(response);
      // Solo con token y si la sesión sigue: así un 401 sin token (login, renovación) lo maneja
      // quien lo pidió, el del logout no navega (la sesión ya se descartó) y de varios 401 a la vez
      // navega el primero.
      const withSession =
        error.status === 401 &&
        !request.context.get(NO_SESSION) &&
        request.headers.has('Authorization') &&
        session.token() !== null;

      if (withSession && !request.context.get(RETRIED)) {
        return defer(() => session.refresh()).pipe(
          switchMap((result) => {
            const token = session.token();
            if (result === 'renewed' && token !== null) {
              // Repetirla es seguro, también un POST: con 401 la API no la ejecutó.
              const retry = request.clone({
                setHeaders: { Authorization: `Bearer ${token}` },
                context: retriedContext(request.context),
              });
              return handle(retry, next, session, router);
            }
            if (result === 'ended' || result === 'renewed') {
              endSession(session, router);
              return throwError(() => error);
            }
            return throwError(() => result); // No disponible: el error de la renovación (§3.5).
          }),
        );
      }
      if (withSession) {
        endSession(session, router); // La repetición también dio 401.
      } else if (error.status === 403 && error.code === 'RN-24') {
        void router.navigate(['/cambio-obligatorio']);
      }
      return throwError(() => error);
    }),
  );
}

/**
 * Una copia del contexto con la marca de repetición. No se marca el original: quien hizo la petición
 * puede reusar el mismo `HttpContext` en otras.
 */
function retriedContext(original: HttpContext): HttpContext {
  const context = new HttpContext();
  for (const key of original.keys()) context.set(key, original.get(key));
  return context.set(RETRIED, true);
}

/** RFF-03: descarta la sesión y abre `V-02` con la ruta de vuelta y el aviso, una sola vez. */
function endSession(session: SessionService, router: Router): void {
  if (session.token() === null) return;
  const volver = router.url;
  session.end();
  void router.navigate(['/iniciar-sesion'], { queryParams: { volver, aviso: 'sesion-terminada' } });
}
