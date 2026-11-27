import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import type { ApiError } from '../../../api/api-error';
import { retryCountdown } from '../../forms/retry-countdown';
import { ActionError } from '../action-error/action-error';

/** La acción adicional de RUI-04 que ofrece la ventana ante un rechazo, p. ej. "Desactivar curso". */
export interface ConfirmAlternative {
  /** El `code` del rechazo que la ofrece (`RN-34`). */
  code: string;
  label: string;
  run: () => Promise<unknown>;
}

/** Lo que recibe `ConfirmService.confirm()` (RUI-07, docs/arquitectura.md §6.2). */
export interface ConfirmOptions {
  /** Nombra la acción y el registro: "¿Desactivar a María Fernanda Quesada Rojas?". */
  title: string;
  /** Explica la consecuencia. */
  message: string;
  /** El botón de confirmar repite el verbo: "Desactivar estudiante", no "Aceptar". */
  action: string;
  /** Reforzada: destaca que no se puede deshacer y deja el foco inicial en "Cancelar". */
  irreversible?: boolean;
  /** El texto de "Cancelar", si la ventana necesita otro ("Seguir editando", RUI-09). */
  cancel?: string;
  /**
   * La acción, si la ejecuta la ventana (decisión 3 de SPEC-componentes): al confirmar, la ventana
   * espera a que termine. Si falla con un `ApiError`, lo muestra sin cerrarse.
   */
  run?: () => Promise<unknown>;
  /** El texto del botón mientras `run` trabaja: "Eliminando…" (RUI-08). */
  running?: string;
  /** La acción adicional ante un rechazo con su `code` (RUI-04). */
  alternative?: ConfirmAlternative;
}

/** Rechazos de una regla o de un permiso: repetir la acción daría lo mismo, solo queda cerrar. */
const FINAL_STATUSES = new Set([403, 404, 409]);

/**
 * La ventana de `ConfirmService`. Se cierra con `true` al confirmar, o cuando `run` termina; con
 * nada al cancelar o después de la acción alternativa.
 */
@Component({
  selector: 'sm-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionError, MatButton, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
  host: { '[class.irreversible]': 'options.irreversible' },
})
export class ConfirmDialog {
  protected readonly options = inject<ConfirmOptions>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<ConfirmDialog, true>>(MatDialogRef);

  /** Qué está trabajando: la acción, la alternativa o nada. */
  protected readonly busy = signal<'action' | 'alternative' | null>(null);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly waitSeconds = retryCountdown(this.error);

  protected readonly final = computed(() => {
    const status = this.error()?.status;
    return status !== undefined && FINAL_STATUSES.has(status);
  });
  protected readonly alternative = computed(() => {
    const alternative = this.options.alternative;
    return alternative !== undefined && this.error()?.code === alternative.code ? alternative : null;
  });
  protected readonly cancelLabel = computed(() =>
    this.error() === null ? (this.options.cancel ?? 'Cancelar') : 'Cerrar',
  );

  protected confirm(): void {
    if (this.options.run === undefined) {
      this.ref.close(true);
      return;
    }
    void this.execute('action', this.options.run);
  }

  protected runAlternative(alternative: ConfirmAlternative): void {
    void this.execute('alternative', alternative.run);
  }

  private async execute(what: 'action' | 'alternative', run: () => Promise<unknown>): Promise<void> {
    this.busy.set(what);
    // Mientras trabaja no se cierra con Escape ni con un clic fuera: la acción ya salió.
    this.ref.disableClose = true;
    try {
      await run();
      this.ref.close(what === 'action' ? true : undefined);
    } catch (error) {
      this.error.set(asApiError(error));
    } finally {
      this.busy.set(null);
      this.ref.disableClose = false;
    }
  }
}

/**
 * Lo que falló, como `ApiError`. Los errores de la API ya llegan así (errorInterceptor); otro error
 * es un fallo del propio SPA y se muestra como uno inesperado, sin detalles (RUI-05).
 */
function asApiError(error: unknown): ApiError {
  if (typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'ApiError') {
    return error as ApiError;
  }
  return { name: 'ApiError', message: 'Error del cliente', status: 500, errors: {}, data: {} };
}
