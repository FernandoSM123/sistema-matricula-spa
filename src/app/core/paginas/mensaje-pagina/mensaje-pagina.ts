import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { homeLink } from '../../session/home-route';
import { SessionService } from '../../session/session-service';

/**
 * El cuerpo de las páginas del sistema (`V-09`, `V-10`): un mensaje y un único enlace a la página
 * de inicio del rol (§2.5 de los requerimientos). El marco lo pone `App`.
 */
@Component({
  selector: 'sm-mensaje-pagina',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatIcon, RouterLink],
  templateUrl: './mensaje-pagina.html',
  styleUrl: './mensaje-pagina.scss',
})
export class MensajePagina {
  readonly icono = input.required<string>();
  readonly titulo = input.required<string>();
  readonly mensaje = input.required<string>();

  private readonly sesion = inject(SessionService);
  protected readonly inicio = computed(() => homeLink(this.sesion));
}
