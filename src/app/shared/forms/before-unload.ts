import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject } from '@angular/core';

/**
 * RUI-09 (§5.5): si el usuario recarga o cierra la pestaña con cambios sin guardar, activa el aviso
 * nativo del navegador, cuyo texto pone el navegador. Se llama en el constructor del formulario, en
 * el contexto de inyección, y el aviso se quita al destruir el componente:
 *
 * ```ts
 * constructor() { warnBeforeUnload(() => this.hasUnsavedChanges()); }
 * ```
 */
export function warnBeforeUnload(hasUnsavedChanges: () => boolean): void {
  const window = inject(DOCUMENT).defaultView;
  if (window === null) return;

  const listener = (event: BeforeUnloadEvent) => {
    if (!hasUnsavedChanges()) return;
    event.preventDefault();
    // Los navegadores que todavía lo exigen para mostrar el aviso.
    event.returnValue = '';
  };
  window.addEventListener('beforeunload', listener);
  inject(DestroyRef).onDestroy(() => window.removeEventListener('beforeunload', listener));
}
