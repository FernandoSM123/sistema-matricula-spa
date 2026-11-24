import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarConfig } from '@angular/material/snack-bar';

const OPCIONES_AVISOS: MatSnackBarConfig = { duration: 5000 };

/**
 * Opciones de Material que van en app.config.ts (§6.1): solo las de lo que el marco usa
 * desde el arranque. Las de las vistas están en `provideMaterialVistas()`.
 */
export function provideMaterial(): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: OPCIONES_AVISOS }]);
}
