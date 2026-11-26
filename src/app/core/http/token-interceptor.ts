import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URL, isApiUrl } from '../../api/api-url';
import { SessionService } from '../session/session-service';

/**
 * Agrega `Authorization: Bearer` solo a las peticiones a la API: el token nunca va a otro origen
 * (§4.2, §4.5). Lo envía aunque haya vencido según `expiraEn`: la API responde `401`, y
 * `errorInterceptor` aplica RFF-03.
 */
export const tokenInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(SessionService).token();
  if (token === null || !isApiUrl(request.url, inject(API_URL))) {
    return next(request);
  }
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
