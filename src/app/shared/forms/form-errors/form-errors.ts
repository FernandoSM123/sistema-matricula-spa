import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

/**
 * Los errores de la API sin campo en el formulario, arriba del formulario (RUI-02, §5.3): los que
 * devuelve `applyServerErrors()`. Sin mensajes no dibuja nada.
 */
@Component({
  selector: 'sm-form-errors',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
  template: `
    @if (messages().length > 0) {
      <div class="box" role="alert">
        <mat-icon class="icon" svgIcon="error" aria-hidden="true" />
        <div>
          @if (heading(); as heading) {
            <p class="heading">{{ heading }}</p>
          }
          @if (messages().length === 1) {
            <p>{{ messages()[0] }}</p>
          } @else {
            <ul>
              @for (message of messages(); track $index) {
                <li>{{ message }}</li>
              }
            </ul>
          }
        </div>
      </div>
    }
  `,
  styles: `
    .box {
      display: flex;
      gap: var(--sm-space-3);
      padding: var(--sm-space-3);
      color: var(--sm-error-text);
      background: var(--sm-error-bg);
      border: 1px solid var(--sm-error-border);
      border-inline-start-width: 4px;
      border-radius: var(--sm-space-1);
    }
    .icon {
      flex: none;
    }
    p,
    ul {
      margin: 0;
    }
    ul {
      padding-inline-start: var(--sm-space-4);
    }
    .heading {
      font-weight: 600;
    }
    .heading + p,
    .heading + ul {
      margin-top: var(--sm-space-1);
    }
  `,
})
export class FormErrors {
  readonly messages = input<readonly string[]>([]);
  /** Una línea antes de los mensajes: "No se pudo registrar el estudiante." */
  readonly heading = input<string>();
}
