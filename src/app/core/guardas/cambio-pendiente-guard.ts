import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RUTAS, rutaDeInicio } from '../sesion/inicio-rol';
import { SesionService } from '../sesion/sesion-service';

/**
 * `V-03`, el cambio obligatorio de contraseña (§4.3): solo con un cambio pendiente. Sin él, a la
 * página de inicio del rol; sin sesión, al inicio de sesión (con el aviso de RFF-03 si venció).
 */
export const cambioPendienteGuard: CanActivateFn = () => {
  const sesion = inject(SesionService);
  const router = inject(Router);

  if (!sesion.activa()) {
    const vencida = sesion.vencida();
    if (vencida) sesion.terminar();
    return router.createUrlTree([RUTAS.inicioSesion], {
      queryParams: vencida ? { aviso: 'sesion-terminada' } : {},
    });
  }
  return sesion.cambioPendiente() ? true : router.parseUrl(rutaDeInicio(sesion));
};
