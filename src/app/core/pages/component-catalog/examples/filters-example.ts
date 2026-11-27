import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { toLabel } from '../../../../shared/formatting/labels';
import { FilterBar } from '../../../../shared/ui/filter-bar/filter-bar';

const ESTADOS = ['Planificado', 'Abierto', 'Cerrado', 'EnCurso', 'Finalizado', 'Cancelado'] as const;

/**
 * Sección 2 del catálogo: `FilterBar` con filtros de la vista proyectados, como en los grupos
 * (V-28). Muestra lo que avisaría a la vista; el listado completo, con la URL, está en la sección 1.
 */
@Component({
  selector: 'sm-filters-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FilterBar, MatFormField, MatLabel, MatOption, MatSelect],
  template: `
    <sm-filter-bar
      searchPlaceholder="NRC o nombre del curso"
      [search]="search()"
      [filtered]="filtered()"
      (searchChange)="search.set($event)"
      (clear)="search.set(''); estado.set(null)"
    >
      <mat-form-field class="filter">
        <mat-label>Estado</mat-label>
        <mat-select [value]="estado()" (selectionChange)="estado.set($event.value)">
          <mat-option [value]="null">Todos</mat-option>
          @for (value of estados; track value) {
            <mat-option [value]="value">{{ label(value) }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </sm-filter-bar>
    <p class="result" aria-live="polite">Filtros aplicados: {{ summary() }}</p>
  `,
  styles: `
    .filter {
      width: 12rem;
    }
    .result {
      margin: var(--sm-space-2) 0 0;
      color: var(--sm-text-secondary);
    }
    @media (max-width: 599.98px) {
      .filter {
        width: auto;
      }
    }
  `,
})
export class FiltersExample {
  protected readonly estados = ESTADOS;
  protected readonly search = signal('');
  protected readonly estado = signal<string | null>(null);
  protected readonly filtered = computed(() => this.search() !== '' || this.estado() !== null);
  protected readonly summary = computed(() => {
    const parts = [];
    if (this.search() !== '') parts.push(`Buscar: "${this.search()}"`);
    if (this.estado() !== null) parts.push(`Estado: ${this.label(this.estado())}`);
    return parts.length > 0 ? parts.join(' · ') : 'ninguno';
  });

  protected label(value: string | null): string {
    return toLabel('estadoGrupo', value);
  }
}
