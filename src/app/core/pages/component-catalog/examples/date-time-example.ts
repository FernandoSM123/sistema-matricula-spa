import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTimepicker, MatTimepickerInput, MatTimepickerToggle } from '@angular/material/timepicker';
import { format } from 'date-fns';
import { FieldError } from '../../../../shared/forms/field-error/field-error';
import { groupErrorMatcher } from '../../../../shared/forms/group-error-matcher';
import { endAfterStart } from '../../../../shared/forms/validators';

/** Lo que se enviaría a la API: `'yyyy-MM-dd'` y `'HH:mm:ss'` (§7.2), o una raya si falta. */
function toApi(value: Date | null | undefined, pattern: string): string {
  return value instanceof Date && !Number.isNaN(value.getTime()) ? `"${format(value, pattern)}"` : '—';
}

/**
 * Sección 4 del catálogo: `mat-datepicker` y `mat-timepicker` con `AppDateAdapter`, sin pieza
 * propia (§7). Muestra lo que se enviaría a la API y el error de RN-15 en la hora de fin.
 */
@Component({
  selector: 'sm-date-time-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FieldError,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatError,
    MatFormField,
    MatHint,
    MatInput,
    MatLabel,
    MatSuffix,
    MatTimepicker,
    MatTimepickerInput,
    MatTimepickerToggle,
    ReactiveFormsModule,
  ],
  template: `
    <form class="grid" [formGroup]="form" novalidate>
      <mat-form-field>
        <mat-label>Inicio de clases</mat-label>
        <input matInput [matDatepicker]="datePicker" formControlName="fechaInicio" />
        <mat-hint>dd/mm/aaaa</mat-hint>
        <mat-datepicker-toggle matSuffix [for]="datePicker" />
        <mat-datepicker #datePicker />
        <mat-error><sm-field-error [control]="form.controls.fechaInicio" field="la fecha de inicio" /></mat-error>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Hora de inicio</mat-label>
        <input matInput [matTimepicker]="startPicker" formControlName="horaInicio" />
        <mat-hint>Por ejemplo, 6:00 p. m.</mat-hint>
        <mat-timepicker-toggle matSuffix [for]="startPicker" />
        <mat-timepicker #startPicker interval="15m" />
        <mat-error><sm-field-error [control]="form.controls.horaInicio" field="la hora de inicio" /></mat-error>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Hora de fin</mat-label>
        <input matInput [matTimepicker]="endPicker" formControlName="horaFin" [errorStateMatcher]="endMatcher" />
        <mat-timepicker-toggle matSuffix [for]="endPicker" />
        <mat-timepicker #endPicker interval="15m" />
        <mat-error>
          <sm-field-error [control]="form.controls.horaFin" field="la hora de fin" groupError="endAfterStart" />
        </mat-error>
      </mat-form-field>
    </form>
    <p class="result">Se envía: fecha {{ sent().fecha }} · inicio {{ sent().inicio }} · fin {{ sent().fin }}</p>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
      align-items: start;
      gap: var(--sm-space-3);
    }
    .result {
      margin: var(--sm-space-2) 0 0;
      color: var(--sm-text-secondary);
    }
  `,
})
export class DateTimeExample {
  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      fechaInicio: [null as Date | null, Validators.required],
      horaInicio: [null as Date | null, Validators.required],
      horaFin: [null as Date | null, Validators.required],
    },
    { validators: endAfterStart('horaInicio', 'horaFin') },
  );
  protected readonly endMatcher = groupErrorMatcher('endAfterStart');

  private readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  protected readonly sent = computed(() => {
    const value = this.value();
    return {
      fecha: toApi(value.fechaInicio, 'yyyy-MM-dd'),
      inicio: toApi(value.horaInicio, 'HH:mm:ss'),
      fin: toApi(value.horaFin, 'HH:mm:ss'),
    };
  });
}
