import { Clipboard } from '@angular/cdk/clipboard';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  Directive,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  Resource,
  TemplateRef,
  untracked,
  WritableResource,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { retryCountdown } from '../../forms/retry-countdown';
import { ACTION_ERROR_TEXT } from '../action-error/action-error';
import { asApiError } from '../as-api-error';

interface ContentContext<T> {
  $implicit: Exclude<T, undefined>;
}

/**
 * El contenido de `ContentState` cuando hay datos: `<ng-template [smContent]="cursos" let-page>`.
 * Recibe el último valor del recurso, que se conserva mientras carga la página siguiente. El recurso
 * se repite aquí solo para tipar la variable de la plantilla.
 */
@Directive({ selector: 'ng-template[smContent]' })
export class ContentTemplate<T> {
  readonly template = inject<TemplateRef<ContentContext<T>>>(TemplateRef);
  readonly smContent = input.required<Resource<T>>();

  /** Tipa `let-x` con el valor del recurso. Angular solo usa la firma; el cuerpo no se ejecuta. */
  static ngTemplateContextGuard<T>(directive: ContentTemplate<T>, context: unknown): context is ContentContext<T> {
    return directive !== null && context !== null;
  }
}

/** Vacío por defecto: un arreglo vacío o una página (`Page<T>`) sin `items`. */
export function defaultIsEmpty(value: unknown): boolean {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object' && value !== null && 'items' in value && Array.isArray(value.items)) {
    return value.items.length === 0;
  }
  return false;
}

type State = 'idle' | 'first-load' | 'content' | 'error';
type ErrorKind = 'hidden' | 'forbidden' | 'not-found' | 'wait' | 'unexpected' | 'no-response' | 'detail';

/**
 * Los estados de contenido de RUI-13 (docs/arquitectura.md §6.2, fila 8) para un `httpResource`:
 *
 * - Primera carga: un indicador en el lugar del contenido. Las recargas y los cambios de página
 *   conservan el último contenido, con una barra de progreso arriba.
 * - Vacío: lo proyectado con `smEmpty` (mensaje y acción de crear de la vista). Con `filtered`,
 *   "No hay resultados para los filtros aplicados" y "Limpiar filtros".
 * - `404`: lo proyectado con `smNotFound` (mensaje y enlace al listado).
 * - `403` sin `code` o con `RN-18`: abre `/sin-permiso` sin cambiar la dirección (§3.5).
 * - `500`, sin respuesta, `429` y otros rechazos: el texto de RUI-03 o el `detail`, con "Reintentar",
 *   que vuelve a pedir el recurso.
 * - `401`: nada, porque `errorInterceptor` ya lleva al inicio de sesión.
 */
@Component({
  selector: 'sm-content-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatProgressBar, MatProgressSpinner, NgTemplateOutlet],
  templateUrl: './content-state.html',
  styleUrl: './content-state.scss',
})
export class ContentState<T> {
  private readonly router = inject(Router);
  private readonly clipboard = inject(Clipboard);

  readonly resource = input.required<Resource<T>>();
  /** Si hay filtros aplicados: cambia el mensaje del vacío. */
  readonly filtered = input(false);
  readonly isEmpty = input<(value: Exclude<T, undefined>) => boolean>(defaultIsEmpty);
  /** El nombre del indicador de carga para los lectores de pantalla: "Cargando estudiantes". */
  readonly loadingLabel = input('Cargando');
  readonly clearFilters = output<void>();

  protected readonly content = contentChild(ContentTemplate);
  protected readonly text = ACTION_ERROR_TEXT;

  /**
   * El último valor, que se conserva mientras carga uno nuevo (un `resource` lo pierde al cambiar
   * sus parámetros). Un error lo descarta: reintentar muestra el indicador, no datos viejos.
   */
  protected readonly last = linkedSignal<
    { status: string; value: { data: Exclude<T, undefined> } | null },
    { data: Exclude<T, undefined> } | null
  >({
    source: () => {
      const resource = this.resource();
      const status = resource.status();
      return {
        status,
        value: resource.hasValue() ? { data: resource.value() as Exclude<T, undefined> } : null,
      };
    },
    computation: (current, previous) =>
      current.status === 'error' ? null : (current.value ?? previous?.value ?? null),
  });

  protected readonly state = computed<State>(() => {
    const resource = this.resource();
    if (resource.status() === 'error') return 'error';
    if (this.last() !== null) return 'content';
    return resource.isLoading() ? 'first-load' : 'idle';
  });

  protected readonly empty = computed(() => {
    const last = this.last();
    return last !== null && this.isEmpty()(last.data);
  });

  protected readonly error = computed(() => {
    const error = this.resource().error();
    return error === undefined ? null : asApiError(error);
  });

  protected readonly waitSeconds = retryCountdown(this.error);
  protected readonly copied = linkedSignal({ source: this.error, computation: () => false });

  protected readonly errorKind = computed<ErrorKind | null>(() => {
    const error = this.error();
    if (error === null) return null;
    if (error.status === 401) return 'hidden';
    if (error.status === 403 && (error.code === undefined || error.code === 'RN-18')) return 'forbidden';
    if (error.status === 403 && error.code === 'RN-24') return 'hidden'; // Lo abre errorInterceptor.
    if (error.status === 404) return 'not-found';
    if (error.status === 0) return 'no-response';
    if (error.status >= 500) return 'unexpected';
    if (error.status === 429 && error.retryAfter !== undefined) return 'wait';
    return 'detail';
  });

  constructor() {
    effect(() => {
      if (this.state() === 'error' && this.errorKind() === 'forbidden') {
        untracked(() => void this.router.navigateByUrl('/sin-permiso', { skipLocationChange: true }));
      }
    });
  }

  protected retry(): void {
    const resource = this.resource();
    if (isWritable(resource)) resource.reload();
  }

  protected copyTraceId(traceId: string): void {
    this.copied.set(this.clipboard.copy(traceId));
  }
}

function isWritable<T>(resource: Resource<T>): resource is WritableResource<T> {
  return typeof (resource as Partial<WritableResource<T>>).reload === 'function';
}
