import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { Rol } from '../../api/models';
import { APP_PATHS } from '../session/home-route';
import { SessionService } from '../session/session-service';
import { checkSession } from './auth-guard';

/**
 * Las vistas de algunos roles (§4.3). Primero aplica la regla de `authGuard`, así sirve sola
 * como `canMatch` de un área de un solo rol (§2.5); con otro rol, lleva a `V-09`.
 */
export function rolGuard(...roles: Rol[]): CanActivateFn & CanMatchFn {
  return () => {
    const session = checkSession();
    if (session !== true) return session;
    const rol = inject(SessionService).rol();
    return rol !== null && roles.includes(rol) ? true : inject(Router).createUrlTree([APP_PATHS.forbidden]);
  };
}
