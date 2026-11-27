import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SmDatePipe } from '../../../../shared/formatting/date-pipe';
import { SmDateTimePipe } from '../../../../shared/formatting/date-time-pipe';
import { DetailHeader } from '../../../../shared/ui/detail-header/detail-header';
import { StatusBadge } from '../../../../shared/ui/status-badge/status-badge';

/** Las pestañas, con su nombre en la URL (`?pestana=matriculas`, §6.2 fila 11). */
const TABS = [
  { id: 'datos', label: 'Datos' },
  { id: 'matriculas', label: 'Matrículas' },
  { id: 'horario', label: 'Horario' },
] as const;

/**
 * Sección 11 del catálogo: el encabezado de un detalle y sus pestañas, como el del estudiante
 * (V-16). La pestaña activa está en la URL: recargar o seguir un enlace con `?pestana=` la abre.
 */
@Component({
  selector: 'sm-detail-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DetailHeader, MatButton, MatTab, MatTabGroup, RouterLink, SmDatePipe, SmDateTimePipe, StatusBadge],
  template: `
    <div class="frame">
      <sm-detail-header heading="María Fernanda Quesada Rojas" subtitle="Cédula 1-1789-0345">
        <a detailBreadcrumb routerLink="/componentes" fragment="c-listado">Estudiantes</a>
        <sm-status-badge detailStatus kind="activo" [value]="true" />
        <button detailActions mat-stroked-button type="button">Editar</button>
        <button detailActions mat-stroked-button type="button">Desactivar</button>
        <button detailActions mat-flat-button type="button" class="danger">Eliminar</button>
      </sm-detail-header>

      <mat-tab-group
        class="tabs"
        aria-label="Secciones del estudiante"
        [selectedIndex]="selectedIndex()"
        (selectedIndexChange)="selectTab($event)"
      >
        <mat-tab label="Datos">
          <dl class="data">
            <div>
              <dt>Cédula</dt>
              <dd>1-1789-0345</dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd>maria.quesada&#64;correo.test</dd>
            </div>
            <div>
              <dt>Teléfono</dt>
              <dd>8812-3456</dd>
            </div>
            <div>
              <dt>Fecha de nacimiento</dt>
              <dd>{{ '2002-05-22' | smDate }}</dd>
            </div>
            <div>
              <dt>Fecha de registro</dt>
              <dd>{{ '2026-07-03' | smDate }}</dd>
            </div>
            <div>
              <dt>Último ingreso</dt>
              <dd>{{ '2026-11-19T14:15:00Z' | smDateTime }}</dd>
            </div>
          </dl>
        </mat-tab>
        <mat-tab label="Matrículas">
          <p class="placeholder">Listado de matrículas (sección 1).</p>
        </mat-tab>
        <mat-tab label="Horario">
          <p class="placeholder">Grilla del horario (sección 10, con el módulo grupos).</p>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: `
    .frame {
      padding: var(--sm-space-3);
      background: var(--sm-surface);
      border: 1px solid var(--sm-secondary-active);
      border-radius: var(--sm-space-1);
    }
    .tabs {
      margin-top: var(--sm-space-4);
    }
    .data {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
      gap: var(--sm-space-3);
      margin: var(--sm-space-3) 0 0;
    }
    dt {
      font-size: 0.875rem;
      color: var(--sm-text-secondary);
    }
    dd {
      margin: 0;
      overflow-wrap: anywhere;
    }
    .placeholder {
      margin: var(--sm-space-3) 0 0;
      color: var(--sm-text-secondary);
    }
  `,
})
export class DetailExample {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly pestana = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });

  protected readonly selectedIndex = computed(() =>
    Math.max(
      0,
      TABS.findIndex((tab) => tab.id === this.pestana().get('pestana')),
    ),
  );

  /** La primera pestaña no se escribe en la URL. Se conservan los demás parámetros (sección 1). */
  protected selectTab(index: number): void {
    if (index === this.selectedIndex()) return;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pestana: index === 0 ? null : TABS[index].id },
      queryParamsHandling: 'merge',
    });
  }
}
