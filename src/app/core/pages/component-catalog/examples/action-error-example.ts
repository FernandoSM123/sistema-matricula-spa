import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import type { ApiError } from '../../../../api/api-error';
import { retryCountdown } from '../../../../shared/forms/retry-countdown';
import { ActionError } from '../../../../shared/ui/action-error/action-error';
import { NotificationService } from '../../../../shared/ui/notification-service';
import { SubmitButton } from '../../../../shared/ui/submit-button/submit-button';

const TRACE_ID = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';

function sample(error: Partial<ApiError> & Pick<ApiError, 'status'>): ApiError {
  return { name: 'ApiError', message: `HTTP ${error.status}`, errors: {}, data: {}, ...error };
}

/** Sección 7 del catálogo: los errores de una acción de §3.5, como en el wireframe. */
@Component({
  selector: 'sm-action-error-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionError, MatButton, SubmitButton],
  template: `
    <h3>Error de una acción (detail de la API)</h3>
    <sm-action-error [error]="conflict" />

    <h3>409 con acción adicional (RUI-04)</h3>
    <div class="stack">
      <sm-action-error [error]="reactivate">
        <button errorActions mat-stroked-button type="button" (click)="notify('Estudiante reactivado')">
          Reactivar estudiante
        </button>
      </sm-action-error>
      <sm-action-error [error]="concurrency" (retryConcurrency)="notify('Datos actuales cargados')" />
    </div>

    <h3>Respuestas con texto fijo (RUI-03)</h3>
    <div class="stack">
      <form class="wait" (submit)="$event.preventDefault(); simulateTooManyAttempts()">
        <sm-action-error [error]="tooManyAttempts()" [waitSeconds]="waitSeconds()" />
        <div class="row">
          <sm-submit-button [waitSeconds]="waitSeconds()">Iniciar sesión</sm-submit-button>
          <span class="hint">Cada envío responde con un 429 de 10 segundos.</span>
        </div>
      </form>
      <sm-action-error [error]="unexpected" />
      <sm-action-error [error]="noResponse" (retry)="notify('Reintentando')" />
    </div>
  `,
  styles: `
    h3 {
      margin: var(--sm-space-4) 0 var(--sm-space-2);
      font-size: 1rem;
    }
    .stack,
    .wait {
      display: grid;
      gap: var(--sm-space-2);
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--sm-space-3);
    }
    .hint {
      color: var(--sm-text-secondary);
      font-size: 0.875rem;
    }
  `,
})
export class ActionErrorExample {
  private readonly notifications = inject(NotificationService);

  protected readonly conflict = sample({ status: 409, code: 'RN-01', detail: 'El grupo no tiene cupos disponibles.' });
  protected readonly reactivate = sample({
    status: 409,
    code: 'RN-39',
    detail: 'Ya existe un estudiante inactivo con esa cédula o ese correo.',
    data: { usuarioId: 12 },
  });
  protected readonly concurrency = sample({
    status: 409,
    code: 'CONCURRENCIA',
    detail: 'Los datos cambiaron mientras se procesaba la solicitud.',
  });
  protected readonly unexpected = sample({ status: 500, traceId: TRACE_ID });
  protected readonly noResponse = sample({ status: 0 });

  protected readonly tooManyAttempts = signal<ApiError | null>(
    sample({ status: 429, detail: 'Demasiados intentos.', retryAfter: 10 }),
  );
  protected readonly waitSeconds = retryCountdown(this.tooManyAttempts);

  protected simulateTooManyAttempts(): void {
    this.tooManyAttempts.set(sample({ status: 429, detail: 'Demasiados intentos.', retryAfter: 10 }));
  }

  protected notify(message: string): void {
    this.notifications.success(message);
  }
}
