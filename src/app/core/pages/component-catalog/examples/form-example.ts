import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import type { ApiError } from '../../../../api/api-error';
import { warnBeforeUnload } from '../../../../shared/forms/before-unload';
import { FieldError } from '../../../../shared/forms/field-error/field-error';
import { focusFirstError } from '../../../../shared/forms/focus-first-error';
import { FormErrors } from '../../../../shared/forms/form-errors/form-errors';
import { LIMITS } from '../../../../shared/forms/limits';
import { applyServerErrors } from '../../../../shared/forms/server-errors';
import {
  cedula,
  fieldsMatch,
  minDate,
  notFutureDate,
  passwordPolicy,
  telefono,
} from '../../../../shared/forms/validators';
import { NotificationService } from '../../../../shared/ui/notification-service';
import { PasswordField } from '../../../../shared/ui/password-field/password-field';
import { SubmitButton } from '../../../../shared/ui/submit-button/submit-button';
import { HasUnsavedChanges } from '../../../guards/unsaved-changes-guard';

/** El 400 que simula el ejemplo: un error con campo y uno sin campo (RUI-02). */
const SAMPLE_400: ApiError = {
  name: 'ApiError',
  message: 'HTTP 400',
  status: 400,
  detail: 'Revise los datos enviados.',
  errors: {
    Cedula: ['Ya existe una persona registrada con esa cédula.'],
    Periodo: ['No hay un periodo abierto para registrar estudiantes.'],
  },
  data: {},
};

/**
 * Sección 3 del catálogo: el formulario de registrar estudiante (V-15) del wireframe, en
 * `/componentes/formulario`, con las piezas de `shared/forms` y `unsavedChangesGuard` en su ruta
 * (RUI-02, RUI-06, RUI-08, RUI-09). El envío es simulado: no llama a la API.
 */
@Component({
  selector: 'sm-form-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FieldError,
    FormErrors,
    MatButton,
    MatCheckbox,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    MatSuffix,
    PasswordField,
    ReactiveFormsModule,
    RouterLink,
    SubmitButton,
  ],
  templateUrl: './form-example.html',
  styleUrl: './form-example.scss',
})
export class FormExample implements HasUnsavedChanges {
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly element: HTMLElement = inject(ElementRef).nativeElement;

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      cedula: ['', [Validators.required, Validators.maxLength(LIMITS.persona.cedula), cedula]],
      fechaNacimiento: [null as Date | null, [notFutureDate, minDate(LIMITS.persona.fechaMinima)]],
      nombre: ['', [Validators.required, Validators.maxLength(LIMITS.persona.nombre)]],
      apellidos: ['', [Validators.required, Validators.maxLength(LIMITS.persona.nombre)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(LIMITS.persona.correo)]],
      telefono: ['', [Validators.required, telefono]],
      direccion: ['', Validators.maxLength(LIMITS.persona.direccion)],
      contrasena: ['', [Validators.required, Validators.maxLength(LIMITS.password.max), passwordPolicy]],
      confirmacion: ['', Validators.required],
    },
    { validators: fieldsMatch('contrasena', 'confirmacion') },
  );

  protected readonly submitting = signal(false);
  protected readonly formErrors = signal<string[]>([]);
  /** Si el envío simulado responde con un 400. */
  protected readonly fail = signal(false);

  constructor() {
    warnBeforeUnload(() => this.hasUnsavedChanges());
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  /** Como §5.4: si es inválido no se envía; el foco va al primer campo con error. */
  protected async save(): Promise<void> {
    this.formErrors.set([]);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      focusFirstError(this.element);
      return;
    }
    this.submitting.set(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (this.fail()) throw SAMPLE_400;
      this.form.markAsPristine();
      this.notifications.success('Estudiante registrado');
      await this.router.navigateByUrl('/componentes');
    } catch (error) {
      this.formErrors.set(applyServerErrors(this.form, error as ApiError));
      focusFirstError(this.element);
    } finally {
      this.submitting.set(false);
    }
  }
}
