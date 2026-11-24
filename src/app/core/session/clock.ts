import { InjectionToken } from '@angular/core';

/** La hora actual en milisegundos. Las pruebas la reemplazan para probar el vencimiento de la sesión. */
export const CLOCK = new InjectionToken<() => number>('CLOCK', {
  providedIn: 'root',
  factory: () => Date.now,
});
