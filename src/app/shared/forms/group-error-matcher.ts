import { AbstractControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/**
 * Muestra en un campo el error de su grupo, como `fieldsMatch` en la confirmación de la contraseña
 * (RN-25) o `endAfterStart` en la hora de fin (RN-15). Esos validadores dejan el error en el grupo,
 * y `mat-error` solo se muestra si el campo está en error. Va junto con `FieldError` y su
 * `groupError`:
 *
 * ```html
 * <input matInput formControlName="confirmacion" [errorStateMatcher]="matchMatcher" />
 * <mat-error><sm-field-error [control]="form.controls.confirmacion" groupError="fieldsMatch" /></mat-error>
 * ```
 *
 * Como `mat-error` por defecto (RUI-06), el error aparece al salir del campo o al enviar.
 */
export function groupErrorMatcher(groupError: string): ErrorStateMatcher {
  return {
    isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
      if (control === null) return false;
      const invalid = control.invalid || control.parent?.hasError(groupError) === true;
      return invalid && (control.touched || form?.submitted === true);
    },
  };
}
