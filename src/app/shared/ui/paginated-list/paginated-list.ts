import { BreakpointObserver } from '@angular/cdk/layout';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  Directive,
  inject,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import type { Page } from '../../../api/pagination';

interface ColumnContext<T> {
  $implicit: T;
}

/**
 * Una columna de `PaginatedList`, declarada una sola vez para la tabla y las tarjetas:
 *
 * ```html
 * <ng-template [smColumn]="page" name="nombre" header="Nombre" primary let-e>{{ e.nombre }}</ng-template>
 * ```
 *
 * La página se repite en `[smColumn]` solo para tipar la variable de la fila.
 */
@Directive({ selector: 'ng-template[smColumn]' })
export class ColumnTemplate<T> {
  readonly template = inject<TemplateRef<ColumnContext<T>>>(TemplateRef);
  readonly smColumn = input.required<Page<T>>();
  /** El nombre interno de la columna; único en el listado. */
  readonly name = input.required<string>();
  /** El rótulo: encabezado de la tabla y etiqueta en la tarjeta. */
  readonly header = input.required<string>();
  /** La columna principal: encabeza la tarjeta y lleva el enlace al detalle. */
  readonly primary = input(false, { transform: booleanAttribute });
  /** Alineada a la derecha en la tabla: números y acciones. */
  readonly end = input(false, { transform: booleanAttribute });

  /** Tipa `let-x` con el tipo de las filas. Angular solo usa la firma; el cuerpo no se ejecuta. */
  static ngTemplateContextGuard<T>(directive: ColumnTemplate<T>, context: unknown): context is ColumnContext<T> {
    return directive !== null && context !== null;
  }
}

/** Lo que avisa el paginador: la página, desde 1 como en la API, y su tamaño. */
export interface PageChange {
  page: number;
  pageSize: number;
}

/** Tamaños de página de RUI-10; 20 por defecto (§3.4). */
export const PAGE_SIZES = [10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 20;

/** Por debajo de 600 px el listado pasa a tarjetas (§6.2, fila 1). */
export const CARDS_QUERY = '(max-width: 599.98px)';

/**
 * Listado paginado (RUI-10, RUI-14, docs/arquitectura.md §6.2 fila 1): `mat-table` desde 600 px y
 * tarjetas por debajo, con las mismas columnas, y `mat-paginator` con 10, 20 y 50 filas. No pide
 * datos: recibe la página y avisa los cambios; la vista navega con los nuevos parámetros (§3.4).
 */
@Component({
  selector: 'sm-paginated-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatPaginator, MatTableModule, NgTemplateOutlet, RouterLink],
  templateUrl: './paginated-list.html',
  styleUrl: './paginated-list.scss',
})
export class PaginatedList<T> {
  readonly page = input.required<Page<T>>();
  /** La ruta del detalle de una fila; la columna principal la enlaza. */
  readonly rowLink = input<(row: T) => string | readonly unknown[]>();
  /** Para los lectores de pantalla: "Estudiantes". */
  readonly label = input.required<string>();
  readonly pageChange = output<PageChange>();

  protected readonly columns = contentChildren(ColumnTemplate);
  protected readonly names = computed(() => this.columns().map((column) => column.name()));
  protected readonly primary = computed(() => this.columns().find((column) => column.primary()) ?? this.columns()[0]);
  protected readonly details = computed(() => this.columns().filter((column) => column !== this.primary()));
  protected readonly pageSizes = PAGE_SIZES;

  protected readonly cards = toSignal(
    inject(BreakpointObserver)
      .observe(CARDS_QUERY)
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  protected linkOf(row: T): string | readonly unknown[] | null {
    return this.rowLink()?.(row) ?? null;
  }

  protected changePage(event: PageEvent): void {
    this.pageChange.emit({ page: event.pageIndex + 1, pageSize: event.pageSize });
  }
}
