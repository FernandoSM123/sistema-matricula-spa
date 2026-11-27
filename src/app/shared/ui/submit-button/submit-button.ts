import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

/**
 * El botón de envío de un formulario (RUI-08, §5.4): la acción principal de la vista. Mientras
 * `submitting`, se deshabilita y muestra que está trabajando ("Registrando…"); durante la espera de
 * un `429` (`waitSeconds`), se deshabilita (RUI-03). El texto normal va como contenido:
 *
 * ```html
 * <sm-submit-button [submitting]="submitting()" working="Registrando…">Registrar estudiante</sm-submit-button>
 * ```
 */
@Component({
  selector: 'sm-submit-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatProgressSpinner],
  template: `
    <button mat-flat-button type="submit" [disabled]="disabled()">
      @if (submitting()) {
        <mat-progress-spinner class="spinner" mode="indeterminate" diameter="18" aria-hidden="true" />
        {{ working() }}
      } @else {
        <ng-content />
      }
    </button>
  `,
  styles: `
    .spinner {
      display: inline-block;
      margin-inline-end: var(--sm-space-2);
      vertical-align: middle;
      --mat-progress-spinner-active-indicator-color: currentColor;
    }
  `,
})
export class SubmitButton {
  readonly submitting = input(false);
  /** El texto mientras se envía. */
  readonly working = input('Enviando…');
  /** Segundos que faltan de la espera de un `429` (de `retryCountdown`, T6). */
  readonly waitSeconds = input(0);

  protected readonly disabled = computed(() => this.submitting() || this.waitSeconds() > 0);
}
