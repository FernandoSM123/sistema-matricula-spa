import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialog, ConfirmOptions } from './confirm-dialog/confirm-dialog';

export type { ConfirmAlternative, ConfirmOptions } from './confirm-dialog/confirm-dialog';

/**
 * Confirmaciones de RUI-07 (docs/arquitectura.md §6.2): `confirm()` abre la ventana y resuelve
 * `true` si el usuario confirma, o `false` si cancela, cierra con Escape o hace clic fuera.
 *
 * Con `run`, la ventana ejecuta la acción y resuelve `true` cuando termina; si falla, muestra el
 * error sin cerrarse, con la acción alternativa de RUI-04 si la hay (decisión 3 de
 * SPEC-componentes). Después de la alternativa resuelve `false`: la alternativa avisa por su cuenta.
 *
 * `MatDialog` lleva el foco a la ventana y lo devuelve al cerrarla (§6.5). En la irreversible, el
 * foco inicial va a "Cancelar" (RUI-07).
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly dialog = inject(MatDialog);

  async confirm(options: ConfirmOptions): Promise<boolean> {
    const ref = this.dialog.open<ConfirmDialog, ConfirmOptions, true>(ConfirmDialog, {
      data: options,
      autoFocus: options.irreversible ? '.cancel' : 'first-tabbable',
      restoreFocus: true,
      maxWidth: '32rem',
      width: 'calc(100vw - 32px)',
    });
    return (await firstValueFrom(ref.afterClosed())) === true;
  }
}
