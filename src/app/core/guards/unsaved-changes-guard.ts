import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmOptions, ConfirmService } from '../../shared/ui/confirm-service';
import { SessionService } from '../session/session-service';

/** Un formulario que avisa si tiene cambios sin guardar (RUI-09, §5.5). */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/** La ventana "¿Descartar los cambios?" del wireframe (`docs/wireframes/componentes.html`). */
export const DISCARD_CHANGES: ConfirmOptions = {
  title: '¿Descartar los cambios?',
  message: 'Hay cambios sin guardar en el formulario. Si sale, se perderán.',
  action: 'Descartar cambios',
  cancel: 'Seguir editando',
};

/**
 * Las navegaciones que provoca el fin de la sesión: el `401` sin renovación y las guardas (RFF-03)
 * y el cierre de sesión (RFF-04). La sesión ya se descartó, así que no tiene sentido quedarse.
 */
const SESSION_END_NOTICES = new Set(['sesion-terminada', 'sesion-cerrada']);

/**
 * RUI-09 (§4.3): al salir de un formulario con cambios sin guardar, pregunta si se descartan. No
 * pregunta si la salida es porque la sesión terminó. Solo `ended()` no alcanza, porque queda en
 * `true` hasta el siguiente inicio de sesión: un visitante que cerró sesión y llena el registro sí
 * debe recibir la pregunta.
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (
  component,
  _currentRoute,
  _currentState,
  nextState,
) => {
  const session = inject(SessionService);
  const confirmService = inject(ConfirmService);

  const sessionEnded = session.ended() && SESSION_END_NOTICES.has(nextState?.root.queryParams['aviso']);
  if (sessionEnded || !component.hasUnsavedChanges()) return true;
  return confirmService.confirm(DISCARD_CHANGES);
};
