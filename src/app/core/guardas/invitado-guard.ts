import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { rutaDeInicio } from '../sesion/inicio-rol';
import { SesionService } from '../sesion/sesion-service';

/**
 * El inicio de sesión, el registro y el olvido de contraseña (§4.3): con sesión, a la página de
 * inicio del rol (o al cambio obligatorio, si está pendiente). Una sesión vencida se descarta.
 */
export const invitadoGuard: CanActivateFn = () => {
  const sesion = inject(SesionService);
  if (sesion.activa()) return inject(Router).parseUrl(rutaDeInicio(sesion));
  if (sesion.vencida()) sesion.terminar();
  return true;
};
