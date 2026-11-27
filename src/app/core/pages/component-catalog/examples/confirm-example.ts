import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import type { ApiError } from '../../../../api/api-error';
import { ConfirmOptions, ConfirmService } from '../../../../shared/ui/confirm-service';
import { NotificationService } from '../../../../shared/ui/notification-service';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Sección 6 del catálogo: las ventanas de confirmación del wireframe (RUI-07). */
@Component({
  selector: 'sm-confirm-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton],
  template: `
    <div class="row">
      @for (example of examples; track example.label) {
        <button mat-stroked-button type="button" (click)="open(example)">{{ example.label }}</button>
      }
    </div>
    <p class="result" aria-live="polite">{{ result() }}</p>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sm-space-2);
    }
    .result {
      margin: var(--sm-space-3) 0 0;
      color: var(--sm-text-secondary);
    }
  `,
})
export class ConfirmExample {
  private readonly confirmService = inject(ConfirmService);
  private readonly notifications = inject(NotificationService);
  protected readonly result = signal('');

  protected readonly examples: readonly (ConfirmOptions & { label: string })[] = [
    {
      label: 'Confirmación simple',
      title: '¿Desactivar a María Fernanda Quesada Rojas?',
      message: 'No podrá iniciar sesión y dejará de aparecer en los listados. Puede reactivarla después.',
      action: 'Desactivar estudiante',
    },
    {
      label: 'Confirmación reforzada',
      title: '¿Eliminar el curso ING-101?',
      message: 'Se eliminará el curso Inglés conversacional I.',
      action: 'Eliminar curso',
      irreversible: true,
    },
    {
      // Decisión 3 de SPEC-componentes: la ventana ejecuta la acción y muestra el rechazo.
      label: 'Reforzada con rechazo (409 RN-34)',
      title: '¿Eliminar el curso ING-101?',
      message: 'Se eliminará el curso Inglés conversacional I.',
      action: 'Eliminar curso',
      running: 'Eliminando…',
      irreversible: true,
      run: () =>
        delay(1500).then(() =>
          Promise.reject({
            name: 'ApiError',
            message: 'HTTP 409 RN-34',
            status: 409,
            code: 'RN-34',
            detail: 'No se puede eliminar el curso porque tiene grupos asociados. Puede desactivarlo.',
            errors: {},
            data: {},
          } satisfies ApiError),
        ),
      alternative: {
        code: 'RN-34',
        label: 'Desactivar curso',
        run: () => delay(1000).then(() => this.notifications.success('Curso desactivado')),
      },
    },
    {
      label: 'Simple que se ejecuta',
      title: '¿Desactivar a María Fernanda Quesada Rojas?',
      message: 'No podrá iniciar sesión y dejará de aparecer en los listados. Puede reactivarla después.',
      action: 'Desactivar estudiante',
      running: 'Desactivando…',
      run: () => delay(1500).then(() => this.notifications.success('Estudiante desactivado')),
    },
    {
      label: 'Cambios sin guardar',
      title: '¿Descartar los cambios?',
      message: 'Hay cambios sin guardar en el formulario. Si sale, se perderán.',
      action: 'Descartar cambios',
      cancel: 'Seguir editando',
    },
  ];

  protected async open({ label, ...options }: ConfirmOptions & { label: string }): Promise<void> {
    const confirmed = await this.confirmService.confirm(options);
    this.result.set(`${label}: ${confirmed ? 'confirmó' : 'canceló'}.`);
  }
}
