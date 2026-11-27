import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import type { ApiError } from '../../../api/api-error';

/** Textos fijos de RUI-03, los únicos que no son el `detail` de la API (RUI-01). */
export const ACTION_ERROR_TEXT = {
  unexpected: 'Ocurrió un error inesperado. Si el problema continúa, reporte este código:',
  unexpectedWithoutCode: 'Ocurrió un error inesperado. Intente de nuevo más tarde.',
  noResponse: 'No se pudo conectar con el servidor. Revise su conexión e intente de nuevo.',
  tooManyAttempts: (seconds: number) =>
    `Demasiados intentos. Intente de nuevo en ${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}.`,
  canRetry: 'Ya puede intentar de nuevo.',
  /** Si la API no trajo `detail` (no debería pasar): nunca se muestra el texto técnico (RUI-05). */
  generic: 'No se pudo completar la acción.',
} as const;

type Kind = 'detail' | 'wait' | 'unexpected' | 'no-response';

/**
 * El error de una acción, junto a ella (RUI-01, RUI-03, RUI-04, docs/arquitectura.md §3.5), con
 * `role="alert"`. Recibe el `ApiError` y dibuja la fila que le toca:
 *
 * - `403`, `404`, `409` y cualquier `code`: el `detail`. Las acciones adicionales de RUI-04
 *   ("Reactivar", la alternativa a eliminar, los enlaces) las pone la vista como contenido con el
 *   atributo `errorActions`. Con `CONCURRENCIA`, "Intentar de nuevo" avisa por `retryConcurrency`.
 * - `429`: "Demasiados intentos…" con la cuenta regresiva de `waitSeconds` (de `retryCountdown`).
 * - `500`: el texto fijo con el `traceId` y "Copiar código".
 * - Sin respuesta (`status: 0`): el texto fijo y "Reintentar", que avisa por `retry`.
 * - `400` con errores por campo: nada, porque los muestran los campos y `FormErrors` (RUI-02).
 */
@Component({
  selector: 'sm-action-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatIcon],
  templateUrl: './action-error.html',
  styleUrl: './action-error.scss',
})
export class ActionError {
  private readonly clipboard = inject(Clipboard);

  readonly error = input<ApiError | null>(null);
  /** Segundos que faltan del `429`, de `retryCountdown()`. */
  readonly waitSeconds = input(0);
  readonly retry = output<void>();
  readonly retryConcurrency = output<void>();

  protected readonly text = ACTION_ERROR_TEXT;

  protected readonly kind = computed<Kind | null>(() => {
    const error = this.error();
    if (error === null) return null;
    if (error.status === 0) return 'no-response';
    if (error.status >= 500) return 'unexpected';
    if (error.status === 429 && error.retryAfter !== undefined) return 'wait';
    if (error.status === 400 && Object.keys(error.errors).length > 0) return null;
    return 'detail';
  });

  protected readonly detail = computed(() => this.error()?.detail ?? ACTION_ERROR_TEXT.generic);
  protected readonly concurrency = computed(() => this.error()?.code === 'CONCURRENCIA');
  /** "Código copiado" hasta el siguiente error. */
  protected readonly copied = linkedSignal({ source: this.error, computation: () => false });

  protected copyTraceId(traceId: string): void {
    this.copied.set(this.clipboard.copy(traceId));
  }
}
