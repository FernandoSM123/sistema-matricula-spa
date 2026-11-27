import { Routes } from '@angular/router';
import { provideMaterialDefaults } from '../../config/material-defaults';
import { unsavedChangesGuard } from '../../guards/unsaved-changes-guard';

/**
 * Rutas del catálogo de componentes (decisión 1 de SPEC-componentes). Se cargan en diferido desde
 * `app.routes.ts`, y registran las opciones de Material como lo hace cada área (§2.5, §6.1): así ni
 * el catálogo ni esas opciones entran en la carga inicial.
 */
export default [
  {
    path: '',
    providers: [provideMaterialDefaults()],
    children: [
      {
        path: '',
        loadComponent: () => import('./component-catalog').then((m) => m.ComponentCatalog),
      },
      {
        // Sección 3: un formulario en su propia ruta, para probar la salida con cambios (RUI-09).
        path: 'formulario',
        title: 'Formulario de ejemplo · Catálogo de componentes · Sistema de Matrícula',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () => import('./examples/form-example').then((m) => m.FormExample),
      },
    ],
  },
] satisfies Routes;
