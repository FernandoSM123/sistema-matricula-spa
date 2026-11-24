import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { homeRoute } from './core/session/home-route';
import { SessionService } from './core/session/session-service';

const SISTEMA = 'Sistema de Matrícula';

/**
 * Rutas de la aplicación (§2.4, §2.5). Cada área agrega aquí la suya, con `loadChildren`, cuando se
 * construye (supuesto 4 de SPEC-nucleo). Hasta entonces, sus rutas caen en `**` y muestran V-10.
 */
export const routes: Routes = [
  // Inicio: la página de inicio del rol, el cambio obligatorio o la oferta (§2.2 de los requerimientos).
  { path: '', pathMatch: 'full', redirectTo: () => homeRoute(inject(SessionService)) },
  {
    path: 'sin-permiso',
    title: `Sin permiso · ${SISTEMA}`,
    canActivate: [authGuard],
    loadComponent: () => import('./core/paginas/sin-permiso/sin-permiso').then((m) => m.SinPermiso),
  },
  {
    path: '**',
    title: `Página no encontrada · ${SISTEMA}`,
    loadComponent: () => import('./core/paginas/no-encontrada/no-encontrada').then((m) => m.NoEncontrada),
  },
];
