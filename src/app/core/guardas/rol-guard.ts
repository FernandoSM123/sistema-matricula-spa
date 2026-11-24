import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { Rol } from '../../api/models';
import { RUTAS } from '../sesion/inicio-rol';
import { SesionService } from '../sesion/sesion-service';
import { revisarSesion } from './sesion-guard';

/**
 * Las vistas de algunos roles (§4.3). Primero aplica la regla de `sesionGuard`, así sirve sola
 * como `canMatch` de un área de un solo rol (§2.5); con otro rol, lleva a `V-09`.
 */
export function rolGuard(...roles: Rol[]): CanActivateFn & CanMatchFn {
  return () => {
    const sesion = revisarSesion();
    if (sesion !== true) return sesion;

    const rol = inject(SesionService).rol();
    return rol !== null && roles.includes(rol) ? true : inject(Router).createUrlTree([RUTAS.sinPermiso]);
  };
}
