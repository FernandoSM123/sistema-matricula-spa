import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { FieldError } from '../../forms/field-error/field-error';
import { groupErrorMatcher } from '../../forms/group-error-matcher';

/**
 * Campo de contraseña con "Mostrar" y "Ocultar" (RUI-06, §6.2), con su etiqueta, su ayuda y su
 * error. Recibe el control del formulario:
 *
 * ```html
 * <sm-password-field [control]="form.controls.contrasena" label="Contraseña nueva" field="la nueva contraseña"
 *   autocomplete="new-password" hint="Al menos 8 caracteres, con una mayúscula y un número." />
 * ```
 *
 * `groupError` muestra en este campo un error del grupo (`fieldsMatch` en la confirmación). Nunca
 * guarda ni muestra la contraseña fuera del campo (AGENTS.md).
 */
@Component({
  selector: 'sm-password-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FieldError,
    MatError,
    MatFormField,
    MatHint,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatSuffix,
    ReactiveFormsModule,
  ],
  template: `
    <mat-form-field>
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [type]="visible() ? 'text' : 'password'"
        [formControl]="control()"
        [autocomplete]="autocomplete()"
        [errorStateMatcher]="matcher()"
        spellcheck="false"
        autocapitalize="off"
      />
      <button
        mat-icon-button
        matSuffix
        type="button"
        [attr.aria-label]="visible() ? 'Ocultar ' + label().toLowerCase() : 'Mostrar ' + label().toLowerCase()"
        [attr.aria-pressed]="visible()"
        (click)="visible.set(!visible())"
      >
        <mat-icon [svgIcon]="visible() ? 'visibility-off' : 'visibility'" aria-hidden="true" />
      </button>
      @if (hint(); as hint) {
        <mat-hint>{{ hint }}</mat-hint>
      }
      <mat-error><sm-field-error [control]="control()" [field]="field()" [groupError]="groupError()" /></mat-error>
    </mat-form-field>
  `,
  styles: `
    :host,
    mat-form-field {
      display: block;
    }
  `,
})
export class PasswordField {
  readonly control = input.required<FormControl<string>>();
  readonly label = input.required<string>();
  /** El dato con su artículo, para "Indique la nueva contraseña." */
  readonly field = input<string>();
  readonly autocomplete = input<'current-password' | 'new-password'>('current-password');
  readonly hint = input<string>();
  readonly groupError = input<string>();

  protected readonly visible = signal(false);

  private readonly defaultMatcher = new ErrorStateMatcher();
  protected readonly matcher = computed(() => {
    const groupError = this.groupError();
    return groupError === undefined ? this.defaultMatcher : groupErrorMatcher(groupError);
  });
}
