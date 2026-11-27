import { ChangeDetectionStrategy, Component, resource, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import type { ApiError } from '../../../../api/api-error';
import { ContentState, ContentTemplate } from '../../../../shared/ui/content-state/content-state';

type Scenario =
  'data' | 'empty' | 'empty-filtered' | 'not-found' | 'unexpected' | 'no-response' | 'too-many' | 'forbidden';

const SCENARIOS: readonly { id: Scenario; label: string }[] = [
  { id: 'data', label: 'Con datos' },
  { id: 'empty', label: 'Vacío sin filtros' },
  { id: 'empty-filtered', label: 'Vacío con filtros' },
  { id: 'not-found', label: '404' },
  { id: 'unexpected', label: '500' },
  { id: 'no-response', label: 'Sin respuesta' },
  { id: 'too-many', label: '429' },
  { id: 'forbidden', label: '403 (abre Sin permiso)' },
];

const CURSOS = ['ING-101 · Inglés conversacional I', 'FOT-110 · Fotografía básica', 'COC-120 · Cocina costarricense'];

function sample(error: Partial<ApiError> & Pick<ApiError, 'status'>): ApiError {
  return { name: 'ApiError', message: `HTTP ${error.status}`, errors: {}, data: {}, ...error };
}

/**
 * Sección 8 del catálogo: `ContentState` con un recurso de ejemplo que tarda 1,2 s. Al cambiar de
 * estado se ve cómo se conserva el contenido con la barra de progreso; tras un error, el indicador.
 */
@Component({
  selector: 'sm-content-state-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ContentState, ContentTemplate, MatButton, MatButtonToggle, MatButtonToggleGroup],
  template: `
    <div class="controls">
      <mat-button-toggle-group
        aria-label="Respuesta simulada"
        [value]="scenario()"
        (change)="scenario.set($event.value)"
      >
        @for (option of scenarios; track option.id) {
          <mat-button-toggle [value]="option.id">{{ option.label }}</mat-button-toggle>
        }
      </mat-button-toggle-group>
      <button mat-stroked-button type="button" (click)="cursos.reload()">Recargar</button>
    </div>

    <div class="frame">
      <sm-content-state
        [resource]="cursos"
        [filtered]="scenario() === 'empty-filtered'"
        loadingLabel="Cargando cursos"
        (clearFilters)="scenario.set('data')"
      >
        <ng-container smEmpty>
          <p class="title">No hay cursos registrados.</p>
          <button mat-flat-button type="button">Registrar curso</button>
        </ng-container>
        <ng-container smNotFound>
          <p class="title">El curso que busca no existe.</p>
          <button mat-stroked-button type="button" (click)="scenario.set('data')">Ir a Cursos</button>
        </ng-container>
        <ng-template [smContent]="cursos" let-cursos>
          <ul>
            @for (curso of cursos; track curso) {
              <li>{{ curso }}</li>
            }
          </ul>
        </ng-template>
      </sm-content-state>
    </div>
  `,
  styles: `
    .controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--sm-space-2);
    }
    mat-button-toggle-group {
      flex-wrap: wrap;
    }
    .frame {
      margin-top: var(--sm-space-3);
      min-height: 10rem;
      background: var(--sm-surface);
      border: 1px solid var(--sm-secondary-active);
      border-radius: var(--sm-space-1);
      overflow: hidden;
    }
    ul {
      margin: 0;
      padding: var(--sm-space-3) var(--sm-space-5);
    }
    li + li {
      margin-top: var(--sm-space-2);
    }
    .title {
      margin: 0;
      font-weight: 600;
    }
  `,
})
export class ContentStateExample {
  protected readonly scenarios = SCENARIOS;
  protected readonly scenario = signal<Scenario>('data');

  protected readonly cursos = resource({
    params: () => this.scenario(),
    loader: async ({ params }) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      switch (params) {
        case 'data':
          return CURSOS;
        case 'empty':
        case 'empty-filtered':
          return [];
        case 'not-found':
          throw sample({ status: 404, detail: 'El curso no existe.' });
        case 'unexpected':
          throw sample({ status: 500, traceId: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01' });
        case 'no-response':
          throw sample({ status: 0 });
        case 'too-many':
          throw sample({ status: 429, detail: 'Demasiados intentos.', retryAfter: 10 });
        case 'forbidden':
          throw sample({ status: 403, detail: 'No tiene permiso para esta acción.' });
      }
    },
  });
}
