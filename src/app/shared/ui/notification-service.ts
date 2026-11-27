import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Lo que dura un aviso de éxito (RUI-21, docs/arquitectura.md §6.1). */
export const NOTIFICATION_DURATION_MS = 5000;

/**
 * Avisos temporales de éxito (RUI-21): breves, no bloqueantes y sin botón para cerrarlos. Se
 * anuncian a los lectores de pantalla sin interrumpir (§6.5).
 *
 * La duración se fija en cada aviso y no con `MAT_SNACK_BAR_DEFAULT_OPTIONS`: ese token metería todo
 * el módulo de avisos en la carga inicial, y en la ruta de un área no llegaría a `MatSnackBar`, que
 * vive en la raíz (decisión 5 de SPEC-nucleo).
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(message, undefined, {
      duration: NOTIFICATION_DURATION_MS,
      politeness: 'polite',
      panelClass: 'sm-success-notification',
    });
  }
}
