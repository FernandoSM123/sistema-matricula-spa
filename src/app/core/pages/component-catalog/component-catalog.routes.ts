import { Routes } from '@angular/router';
import { provideMaterialDefaults } from '../../config/material-defaults';

/**
 * Rutas del catálogo de componentes (decisión 1 de SPEC-componentes). Se cargan en diferido desde
 * `app.routes.ts`, y registran las opciones de Material como lo hace cada área (§2.5, §6.1): así ni
 * el catálogo ni esas opciones entran en la carga inicial.
 */
export default [
  {
    path: '',
    providers: [provideMaterialDefaults()],
    loadComponent: () => import('./component-catalog').then((m) => m.ComponentCatalog),
  },
] satisfies Routes;
