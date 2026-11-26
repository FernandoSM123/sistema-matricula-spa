import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { APP_PATHS, homeRoute } from '../session/home-route';
import { SessionService } from '../session/session-service';

/**
 * `V-03`, el cambio obligatorio de contraseña (§4.3): solo con un cambio pendiente. Sin él, a la
 * página de inicio del rol; sin sesión, al inicio de sesión (con el aviso de RFF-03 si venció).
 */
export const passwordChangeGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (!session.isActive()) {
    const expired = session.isExpired();
    if (expired) session.end();
    return router.createUrlTree([APP_PATHS.login], {
      queryParams: expired ? { aviso: 'sesion-terminada' } : {},
    });
  }
  return session.passwordChangePending() ? true : router.parseUrl(homeRoute(session));
};
