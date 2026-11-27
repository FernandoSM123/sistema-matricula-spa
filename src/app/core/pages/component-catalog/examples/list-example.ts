import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import type { Page } from '../../../../api/pagination';
import { ContentState, ContentTemplate } from '../../../../shared/ui/content-state/content-state';
import { FilterBar } from '../../../../shared/ui/filter-bar/filter-bar';
import {
  ColumnTemplate,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
  PageChange,
  PaginatedList,
} from '../../../../shared/ui/paginated-list/paginated-list';
import { StatusBadge } from '../../../../shared/ui/status-badge/status-badge';

interface Estudiante {
  id: number;
  cedula: string;
  nombre: string;
  correo: string;
  telefono: string;
  activo: boolean;
}

const NOMBRES = ['María Fernanda', 'José Pablo', 'Valeria', 'Andrés', 'Luis Diego', 'Daniela', 'Sofía', 'Mauricio'];
const APELLIDOS = ['Quesada Rojas', 'Araya Brenes', 'Chaves Mora', 'Salazar Ulate', 'Navarro Pérez', 'Solís Vega'];

/** 46 estudiantes de ejemplo; uno de cada siete, inactivo. */
const ESTUDIANTES: readonly Estudiante[] = Array.from({ length: 46 }, (_, i) => {
  const nombre = `${NOMBRES[i % NOMBRES.length]} ${APELLIDOS[i % APELLIDOS.length]}`;
  return {
    id: i + 1,
    cedula: `${(i % 7) + 1}-${String(1000 + i * 37).padStart(4, '0')}-${String(100 + i * 13)
      .slice(-4)
      .padStart(4, '0')}`,
    nombre,
    correo: `${nombre.split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}.${i + 1}@correo.test`,
    telefono: `8${String(100 + i).padStart(3, '0')}-${String(4000 + i * 11).slice(-4)}`,
    activo: i % 7 !== 3,
  };
});

/** Los parámetros del listado, como en la URL y en la API (§3.4). */
interface Filters {
  search: string;
  page: number;
  pageSize: number;
  incluirInactivos: boolean;
}

function toFilters(params: Record<string, string | undefined>): Filters {
  const page = Number(params['page']);
  const pageSize = Number(params['pageSize']);
  return {
    search: params['search']?.trim() ?? '',
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    pageSize: (PAGE_SIZES as readonly number[]).includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE,
    incluirInactivos: params['incluirInactivos'] === 'true',
  };
}

/** La búsqueda en memoria que haría la API, con 600 ms de espera. */
async function search(filters: Filters): Promise<Page<Estudiante>> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const text = filters.search.toLocaleLowerCase('es-CR');
  const found = ESTUDIANTES.filter(
    (e) =>
      (filters.incluirInactivos || e.activo) &&
      (text === '' || `${e.cedula} ${e.nombre} ${e.correo}`.toLocaleLowerCase('es-CR').includes(text)),
  );
  const start = (filters.page - 1) * filters.pageSize;
  return {
    items: found.slice(start, start + filters.pageSize),
    page: filters.page,
    pageSize: filters.pageSize,
    totalCount: found.length,
  };
}

/**
 * Secciones 1 y 9 del catálogo: un listado de estudiantes en memoria, armado como lo hará una vista.
 * El estado está en la URL (`?search=&page=&pageSize=&incluirInactivos=`): recargar o volver atrás
 * lo conserva. Cambiar un filtro vuelve a la página 1 (§3.4).
 */
@Component({
  selector: 'sm-list-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ColumnTemplate, ContentState, ContentTemplate, FilterBar, PaginatedList, StatusBadge],
  template: `
    <sm-filter-bar
      searchPlaceholder="Nombre, cédula o correo"
      showInactive
      [search]="filters().search"
      [inactive]="filters().incluirInactivos"
      [filtered]="filtered()"
      (searchChange)="navigate({ search: $event })"
      (inactiveChange)="navigate({ incluirInactivos: $event })"
      (clear)="navigate({ search: '', incluirInactivos: false })"
    />

    <div class="frame">
      <sm-content-state
        [resource]="estudiantes"
        [filtered]="filtered()"
        loadingLabel="Cargando estudiantes"
        (clearFilters)="navigate({ search: '', incluirInactivos: false })"
      >
        <p smEmpty class="title">No hay estudiantes registrados.</p>
        <ng-template [smContent]="estudiantes" let-page>
          <sm-paginated-list label="Estudiantes" [page]="page" [rowLink]="detailLink" (pageChange)="changePage($event)">
            <ng-template [smColumn]="page" name="cedula" header="Cédula" let-e>{{ e.cedula }}</ng-template>
            <ng-template [smColumn]="page" name="nombre" header="Nombre" primary let-e>{{ e.nombre }}</ng-template>
            <ng-template [smColumn]="page" name="correo" header="Correo" let-e>{{ e.correo }}</ng-template>
            <ng-template [smColumn]="page" name="telefono" header="Teléfono" let-e>{{ e.telefono }}</ng-template>
            <ng-template [smColumn]="page" name="estado" header="Estado" let-e>
              <sm-status-badge kind="activo" [value]="e.activo" />
            </ng-template>
          </sm-paginated-list>
        </ng-template>
      </sm-content-state>
    </div>
  `,
  styles: `
    .frame {
      margin-top: var(--sm-space-3);
      border: 1px solid var(--sm-secondary-active);
      border-radius: var(--sm-space-1);
      overflow: hidden;
      background: var(--sm-surface);
    }
    .title {
      margin: 0;
      font-weight: 600;
    }
  `,
})
export class ListExample {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly queryParams = toSignal(this.route.queryParams, { initialValue: {} });
  protected readonly filters = computed(() => toFilters(this.queryParams()));
  protected readonly filtered = computed(() => this.filters().search !== '' || this.filters().incluirInactivos);

  protected readonly estudiantes = resource({ params: () => this.filters(), loader: ({ params }) => search(params) });

  /** La ruta del detalle (V-16). Todavía no existe: el enlace abre "Página no encontrada". */
  protected readonly detailLink = (e: Estudiante) => ['/estudiantes', e.id];

  /** Cambiar un filtro vuelve a la página 1. Los valores por defecto no se escriben en la URL. */
  protected navigate(change: Partial<Filters>): void {
    this.write({ ...this.filters(), ...change, page: 1 });
  }

  protected changePage({ page, pageSize }: PageChange): void {
    this.write({ ...this.filters(), page, pageSize });
  }

  private write(filters: Filters): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: filters.search || null,
        page: filters.page === 1 ? null : filters.page,
        pageSize: filters.pageSize === DEFAULT_PAGE_SIZE ? null : filters.pageSize,
        incluirInactivos: filters.incluirInactivos || null,
      },
      queryParamsHandling: 'merge', // Conserva ?pestana= de la sección 11.
    });
  }
}
