import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { homeRoute } from '../session/home-route';
import { SessionService } from '../session/session-service';

/**
 * El inicio de sesión, el registro y el olvido de contraseña (§4.3): con sesión, a la página de
 * inicio del rol (o al cambio obligatorio, si está pendiente). Una sesión vencida se descarta.
 */
export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  if (session.isActive()) return inject(Router).parseUrl(homeRoute(session));
  if (session.isExpired()) session.end();
  return true;
};
