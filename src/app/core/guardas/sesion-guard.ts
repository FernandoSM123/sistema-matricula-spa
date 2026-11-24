import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';
import { RUTAS } from '../sesion/inicio-rol';
import { SesionService } from '../sesion/sesion-service';

/**
 * Las vistas protegidas (§4.3):
 * - sin sesión, al inicio de sesión con la ruta pedida en `volver`;
 * - con la sesión vencida según `expiraEn`, además con el aviso de RFF-03;
 * - con un cambio de contraseña pendiente, al cambio obligatorio (RN-24).
 *
 * Sirve como `canActivate` y como `canMatch`.
 */
export const sesionGuard: CanActivateFn & CanMatchFn = () => revisarSesion();

/** La regla de `sesionGuard`, que también aplica `rolGuard` antes de revisar el rol. */
export function revisarSesion(): true | UrlTree {
  const sesion = inject(SesionService);
  const router = inject(Router);

  if (!sesion.activa()) {
    const vencida = sesion.vencida();
    if (vencida) sesion.terminar();
    const volver = urlPedida(router);
    return router.createUrlTree([RUTAS.inicioSesion], {
      queryParams: vencida ? { volver, aviso: 'sesion-terminada' } : { volver },
    });
  }
  if (sesion.cambioPendiente()) {
    return router.createUrlTree([RUTAS.cambioObligatorio]);
  }
  return true;
}

/**
 * La dirección que pidió el usuario, con sus parámetros. Sale de la navegación en curso porque
 * `canMatch` no recibe el `RouterStateSnapshot`.
 */
function urlPedida(router: Router): string {
  const pedida = router.currentNavigation()?.extractedUrl;
  return pedida ? router.serializeUrl(pedida) : router.url;
}
