import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import type { ApiError } from '../../api/api-error';

/**
 * Pone los errores del servidor en sus campos (RUI-02, docs/arquitectura.md §5.3) y devuelve los
 * mensajes que no encontraron campo, que `FormErrors` muestra arriba del formulario.
 *
 * - `400`: cada clave de `errors` se busca sin distinguir mayúsculas (`Cedula` ↔ `cedula`), y
 *   también como ruta: `Horarios.HoraFin` o `Horarios[0].HoraFin`.
 * - `409` con un `code` de `codeFields` (`RF-09`, `RN-25`, RUI-04): el `detail` va a ese campo.
 *
 * El control recibe el error `server` con el primer mensaje y queda tocado, para que `mat-error` lo
 * muestre. Desaparece cuando el usuario cambia el campo, porque Angular vuelve a validar. Los
 * valores escritos no se tocan (RUI-01). Con otro error devuelve `[]`: lo muestra `ActionError`.
 */
export function applyServerErrors(
  form: AbstractControl,
  error: ApiError,
  codeFields: Readonly<Record<string, string>> = {},
): string[] {
  if (error.status === 409 && error.code !== undefined && error.detail !== undefined) {
    const path = codeFields[error.code];
    if (path !== undefined) {
      return markServerError(findControl(form, path), error.detail) ? [] : [error.detail];
    }
  }
  if (error.status !== 400) return [];

  const unplaced: string[] = [];
  for (const [key, messages] of Object.entries(error.errors)) {
    if (messages.length === 0) continue;
    if (!markServerError(findControl(form, key), messages[0])) unplaced.push(...messages);
  }
  return unplaced;
}

function markServerError(control: AbstractControl | null, message: string): boolean {
  if (control === null) return false;
  control.setErrors({ ...control.errors, server: message });
  control.markAsTouched();
  return true;
}

/** Busca el control de una clave de la API: segmentos separados por `.` o `[n]`. */
function findControl(form: AbstractControl, key: string): AbstractControl | null {
  const segments = key.split(/[.[\]]/).filter((segment) => segment !== '');
  if (segments.length === 0) return null;

  let control: AbstractControl | null = form;
  for (const segment of segments) {
    control = child(control, segment);
    if (control === null) return null;
  }
  return control;
}

function child(control: AbstractControl, segment: string): AbstractControl | null {
  if (control instanceof FormArray) {
    return /^\d+$/.test(segment) ? (control.at(Number(segment)) ?? null) : null;
  }
  if (control instanceof FormGroup) {
    const wanted = segment.toLowerCase();
    const name = Object.keys(control.controls).find((key) => key.toLowerCase() === wanted);
    return name === undefined ? null : control.controls[name];
  }
  return null;
}
