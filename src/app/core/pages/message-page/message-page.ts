import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { homeLink } from '../../session/home-route';
import { SessionService } from '../../session/session-service';

/**
 * El cuerpo de las páginas del sistema (`V-09`, `V-10`): un mensaje y un único enlace a la página
 * de inicio del rol (§2.5 de los requerimientos). El layout lo pone `App`.
 *
 * El título es `heading` y no `title`: `title` es un atributo global de HTML, y en el elemento
 * mostraría el texto como tooltip.
 */
@Component({
  selector: 'sm-message-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatIcon, RouterLink],
  templateUrl: './message-page.html',
  styleUrl: './message-page.scss',
})
export class MessagePage {
  readonly icon = input.required<string>();
  readonly heading = input.required<string>();
  readonly message = input.required<string>();

  private readonly session = inject(SessionService);
  protected readonly home = computed(() => homeLink(this.session));
}
