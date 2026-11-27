import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { EMPTY, merge, scan, startWith, switchMap } from 'rxjs';
import { errorMessage } from '../messages';

/**
 * El mensaje del error de un campo (§5.2), dentro de `mat-error`:
 *
 * ```html
 * <mat-error><sm-field-error [control]="form.controls.apellidos" field="los apellidos" /></mat-error>
 * ```
 *
 * - `field`: el dato con su artículo, para "Indique los apellidos." (`required`).
 * - `groupError`: el error del grupo que se muestra en este campo si el campo no tiene uno propio
 *   (`fieldsMatch`, `endAfterStart`), junto con `groupErrorMatcher()`.
 *
 * Lee los cambios del control (y de su grupo) con `control.events`, porque los errores no son
 * signals y el componente es `OnPush`.
 */
@Component({
  selector: 'sm-field-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '{{ message() }}',
})
export class FieldError {
  readonly control = input.required<AbstractControl>();
  readonly field = input<string>();
  readonly groupError = input<string>();

  /** Cambia cada vez que el control o su grupo emiten un evento. */
  private readonly changes = toSignal(
    toObservable(this.control).pipe(
      switchMap((control) => merge(control.events, control.parent?.events ?? EMPTY).pipe(startWith(null))),
      scan((count) => count + 1, 0),
    ),
    { initialValue: 0 },
  );

  protected readonly message = computed(() => {
    this.changes();
    const control = this.control();
    if (control.errors !== null) return errorMessage(control.errors, this.field());

    const groupError = this.groupError();
    const parent = control.parent;
    if (groupError !== undefined && parent?.hasError(groupError)) {
      return errorMessage({ [groupError]: parent.getError(groupError) }, this.field());
    }
    return null;
  });
}
