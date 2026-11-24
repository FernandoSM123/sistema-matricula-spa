import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URL, esUrlDeLaApi } from '../../api/api-url';
import { SesionService } from '../sesion/sesion-service';

/**
 * Agrega `Authorization: Bearer` solo a las peticiones a la API: el token nunca va a otro origen
 * (§4.2, §4.5). Lo envía aunque haya vencido según `expiraEn`: la API responde `401`, y
 * `erroresInterceptor` aplica RFF-03.
 */
export const tokenInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const token = inject(SesionService).token();
  if (token === null || !esUrlDeLaApi(peticion.url, inject(API_URL))) {
    return siguiente(peticion);
  }
  return siguiente(peticion.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
