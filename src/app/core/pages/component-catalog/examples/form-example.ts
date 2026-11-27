import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { warnBeforeUnload } from '../../../../shared/forms/before-unload';
import { LIMITS } from '../../../../shared/forms/limits';
import { NotificationService } from '../../../../shared/ui/notification-service';
import { HasUnsavedChanges } from '../../../guards/unsaved-changes-guard';

/**
 * Sección 3 del catálogo: el formulario de ejemplo en `/componentes/formulario`, con
 * `unsavedChangesGuard` en su ruta y el aviso de `beforeunload` (RUI-09). Las piezas del formulario
 * (`FieldError`, `SubmitButton`, `PasswordField`) llegan en T5.
 */
@Component({
  selector: 'sm-form-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatError, MatFormField, MatInput, MatLabel, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <p><a routerLink="/componentes">Volver al catálogo</a></p>
      <h1>Formulario de ejemplo</h1>
      <p class="note">
        Escriba algo y salga con el enlace o el botón Atrás: pregunta si descarta los cambios. Después de "Guardar" no
        pregunta. Al recargar la pestaña con cambios, el navegador muestra su aviso.
      </p>

      <form [formGroup]="form" (ngSubmit)="save()">
        <mat-form-field>
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" autocomplete="given-name" />
          <mat-error>Indique el nombre.</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Apellidos</mat-label>
          <input matInput formControlName="apellidos" autocomplete="family-name" />
          <mat-error>Indique los apellidos.</mat-error>
        </mat-form-field>
        <div class="actions">
          <button mat-flat-button type="submit">Guardar</button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .page {
      max-width: 700px;
      margin-inline: auto;
      padding: var(--sm-space-4) var(--sm-space-3);
    }
    h1 {
      margin: 0 0 var(--sm-space-2);
      font-size: 1.5rem;
    }
    .note {
      color: var(--sm-text-secondary);
    }
    form {
      display: grid;
      gap: var(--sm-space-2);
      margin-top: var(--sm-space-4);
      padding: var(--sm-space-4);
      background: var(--sm-surface);
      border: 1px solid var(--sm-secondary-active);
      border-radius: var(--sm-space-2);
    }
    .actions {
      display: flex;
      justify-content: flex-end;
    }
  `,
})
export class FormExample implements HasUnsavedChanges {
  private readonly notifications = inject(NotificationService);

  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', [Validators.required, Validators.maxLength(LIMITS.persona.nombre)]],
    apellidos: ['', [Validators.required, Validators.maxLength(LIMITS.persona.nombre)]],
  });

  constructor() {
    warnBeforeUnload(() => this.hasUnsavedChanges());
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.form.markAsPristine();
    this.notifications.success('Datos guardados');
  }
}
