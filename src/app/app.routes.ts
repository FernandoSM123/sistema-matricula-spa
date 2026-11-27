import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { homeRoute } from './core/session/home-route';
import { SessionService } from './core/session/session-service';

const APP_NAME = 'Sistema de Matrícula';

/**
 * Rutas de la aplicación (§2.4, §2.5). Cada área agrega aquí la suya, con `loadChildren`, cuando se
 * construye (supuesto 4 de SPEC-nucleo). Hasta entonces, sus rutas caen en `**` y muestran V-10.
 */
export const routes: Routes = [
  // Inicio: la página de inicio del rol, el cambio obligatorio o la oferta (§2.2 de los requerimientos).
  { path: '', pathMatch: 'full', redirectTo: () => homeRoute(inject(SessionService)) },
  {
    path: 'sin-permiso',
    title: `Sin permiso · ${APP_NAME}`,
    canActivate: [authGuard],
    loadComponent: () => import('./core/pages/forbidden/forbidden').then((m) => m.Forbidden),
  },
  {
    // Catálogo de componentes, para las pruebas visuales (decisión 1 de SPEC-componentes). Sin
    // sesión y sin enlaces desde la aplicación: solo se abre escribiendo la dirección.
    path: 'componentes',
    title: `Catálogo de componentes · ${APP_NAME}`,
    loadChildren: () => import('./core/pages/component-catalog/component-catalog.routes'),
  },
  {
    path: '**',
    title: `Página no encontrada · ${APP_NAME}`,
    loadComponent: () => import('./core/pages/not-found/not-found').then((m) => m.NotFound),
  },
];
