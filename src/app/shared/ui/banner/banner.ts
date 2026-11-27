import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

export type BannerTone = 'warning' | 'info' | 'success' | 'error';

const ICONS: Record<BannerTone, string> = {
  warning: 'warning',
  info: 'info',
  success: 'success',
  error: 'error',
};

/**
 * Aviso fijo en línea (RUI-21): queda hasta que se resuelve o se cierra, por ejemplo cuando no se
 * pudo enviar la contraseña temporal (`correoEnviado: false`). El tipo se distingue por el ícono y
 * el borde, no solo por el color (§6.6).
 *
 * El texto llega por `heading` (la línea destacada) y `message`; las acciones de la vista, como
 * contenido con el atributo `bannerActions`.
 */
@Component({
  selector: 'sm-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatIcon],
  templateUrl: './banner.html',
  styleUrl: './banner.scss',
  host: {
    '[class]': '"tone-" + tone()',
    '[attr.role]': 'tone() === "error" ? "alert" : "status"',
  },
})
export class Banner {
  readonly tone = input<BannerTone>('warning');
  readonly heading = input<string>();
  readonly message = input<string>();
  /** Si muestra "Cerrar". */
  readonly closable = input(false, { transform: booleanAttribute });
  readonly closed = output<void>();

  protected readonly icon = computed(() => ICONS[this.tone()]);
}
