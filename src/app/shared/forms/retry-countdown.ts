import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, of, startWith, switchMap, takeWhile, timer } from 'rxjs';
import type { ApiError } from '../../api/api-error';

/**
 * La espera de un `429` (RUI-03, supuesto 3 de SPEC-componentes): los segundos que faltan del
 * `retryAfter` del error, que bajan de a uno hasta 0. Sin `429` o sin `retryAfter`, 0. Un error
 * nuevo reinicia la cuenta.
 *
 * La vista la crea una vez, en el contexto de inyección, y se la pasa a `ActionError` (para el
 * texto) y a `SubmitButton` (para deshabilitarse), así los dos cuentan con el mismo reloj:
 *
 * ```ts
 * protected readonly error = signal<ApiError | null>(null);
 * protected readonly waitSeconds = retryCountdown(this.error);
 * ```
 */
export function retryCountdown(error: Signal<ApiError | null>): Signal<number> {
  return toSignal(
    toObservable(error).pipe(
      switchMap((current) => {
        const seconds = current?.status === 429 ? (current.retryAfter ?? 0) : 0;
        if (seconds <= 0) return of(0);
        // Empieza con N al instante (timer(0) llegaría en el siguiente ciclo) y baja cada segundo.
        return timer(1000, 1000).pipe(
          map((tick) => seconds - 1 - tick),
          startWith(seconds),
          takeWhile((left) => left > 0, true),
        );
      }),
    ),
    { initialValue: 0 },
  );
}
