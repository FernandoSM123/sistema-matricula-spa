import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';
import { APP_PATHS } from '../session/home-route';
import { SessionService } from '../session/session-service';

/**
 * Las vistas protegidas (§4.3):
 * - sin sesión, al inicio de sesión con la ruta pedida en `volver`;
 * - con la sesión vencida según `expiraEn`, además con el aviso de RFF-03;
 * - con un cambio de contraseña pendiente, al cambio obligatorio (RN-24).
 *
 * Sirve como `canActivate` y como `canMatch`.
 */
export const authGuard: CanActivateFn & CanMatchFn = () => checkSession();

/** La regla de `authGuard`, que también aplica `rolGuard` antes de revisar el rol. */
export function checkSession(): true | UrlTree {
  const session = inject(SessionService);
  const router = inject(Router);

  if (!session.isActive()) {
    const expired = session.isExpired();
    if (expired) session.end();
    const volver = requestedUrl(router);
    return router.createUrlTree([APP_PATHS.login], {
      queryParams: expired ? { volver, aviso: 'sesion-terminada' } : { volver },
    });
  }
  if (session.passwordChangePending()) {
    return router.createUrlTree([APP_PATHS.passwordChange]);
  }
  return true;
}

/**
 * La dirección que pidió el usuario, con sus parámetros. Sale de la navegación en curso porque
 * `canMatch` no recibe el `RouterStateSnapshot`.
 */
function requestedUrl(router: Router): string {
  const requested = router.currentNavigation()?.extractedUrl;
  return requested ? router.serializeUrl(requested) : router.url;
}
