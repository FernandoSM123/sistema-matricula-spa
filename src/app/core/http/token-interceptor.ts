import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { defer, switchMap } from 'rxjs';
import { API_URL, isApiUrl } from '../../api/api-url';
import { NO_SESSION } from '../../api/http-context';
import { SessionService } from '../session/session-service';

/**
 * Agrega `Authorization: Bearer` solo a las peticiones a la API: el token nunca va a otro origen
 * (§4.2, §4.5). Las marcadas con `NO_SESSION` (la renovación) van sin él.
 *
 * Si el token de acceso ya venció según `expiraEn` y la sesión tiene refresh token, primero lo
 * renueva (RF-60), así la petición no sale con un token que la API va a rechazar. Si la renovación
 * falla, la envía igual con el que hay: la API responde `401` y `errorInterceptor` decide.
 */
export const tokenInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.context.get(NO_SESSION) || !isApiUrl(request.url, inject(API_URL))) {
    return next(request);
  }
  const session = inject(SessionService);
  if (session.token() === null) return next(request);

  if (session.accessExpired() && session.canRefresh()) {
    return defer(() => session.refresh()).pipe(switchMap(() => send(request, next, session)));
  }
  return send(request, next, session);
};

/** Envía con el token que haya en este momento (el nuevo, si se acaba de renovar). */
function send(request: HttpRequest<unknown>, next: HttpHandlerFn, session: SessionService) {
  const token = session.token();
  return next(token === null ? request : request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
}
