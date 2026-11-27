import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';

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
}

/** La ventana de `ConfirmService`. Se cierra con `true` al confirmar; con nada al cancelar. */
@Component({
  selector: 'sm-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
  host: { '[class.irreversible]': 'options.irreversible' },
})
export class ConfirmDialog {
  protected readonly options = inject<ConfirmOptions>(MAT_DIALOG_DATA);
}
