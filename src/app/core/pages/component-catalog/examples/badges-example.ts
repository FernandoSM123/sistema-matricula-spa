import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BadgeKind, StatusBadge } from '../../../../shared/ui/status-badge/status-badge';

interface Row {
  dato: string;
  kind: BadgeKind;
  values: readonly (string | boolean)[];
  refuerzo: string;
}

/** Sección 9 del catálogo: las etiquetas de estado con su tono y su refuerzo (§6.6). */
@Component({
  selector: 'sm-badges-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusBadge],
  template: `
    <div class="frame">
      <table>
        <thead>
          <tr>
            <th scope="col">Dato</th>
            <th scope="col">Etiquetas</th>
            <th scope="col">Refuerzo visual</th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track row.dato) {
            <tr>
              <td>{{ row.dato }}</td>
              <td>
                <span class="badges">
                  @for (value of row.values; track $index) {
                    <sm-status-badge [kind]="row.kind" [value]="value" />
                  }
                </span>
              </td>
              <td>{{ row.refuerzo }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    .frame {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--sm-surface);
    }
    th,
    td {
      padding: var(--sm-space-2);
      text-align: start;
      vertical-align: top;
      border: 1px solid var(--sm-secondary-active);
    }
    th {
      background: var(--sm-secondary-soft);
    }
    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sm-space-2);
    }
  `,
})
export class BadgesExample {
  protected readonly rows: readonly Row[] = [
    {
      dato: 'Estado del grupo',
      kind: 'estadoGrupo',
      values: ['Planificado', 'Abierto', 'Cerrado', 'EnCurso', 'Finalizado', 'Cancelado'],
      refuerzo: 'Discontinuo · relleno · doble · normal · apagado · tachado',
    },
    {
      dato: 'Estado de la matrícula',
      kind: 'estadoMatricula',
      values: ['Activa', 'Retirada'],
      refuerzo: 'Relleno · apagado',
    },
    {
      dato: 'Registro (personas, cursos, aulas)',
      kind: 'activo',
      values: [true, false],
      refuerzo: 'Normal · apagado. Los inactivos solo aparecen con "Incluir inactivos"',
    },
    {
      dato: 'Otras marcas',
      kind: 'marca',
      values: ['vigente', 'yaMatriculado', 'sinCupo', 'sistema'],
      refuerzo: 'Periodo vigente, oferta (RFF-30), cupos llenos (doble), autor de auditoría null (RFF-39)',
    },
    {
      dato: 'Valor desconocido',
      kind: 'estadoGrupo',
      values: ['Suspendido'],
      refuerzo: 'Neutro, con el texto tal como llega',
    },
  ];
}
