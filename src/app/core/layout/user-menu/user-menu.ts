import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { SmLabelPipe } from '../../../shared/formatting/label-pipe';
import { SessionService } from '../../session/session-service';
import { USER_MENU_ITEMS } from '../nav-items';

/**
 * El menú de la cuenta (§2.3 de los requerimientos): el nombre y el rol de quien inició sesión,
 * Mi perfil, Cambiar contraseña y Cerrar sesión (RFF-04).
 */
@Component({
  selector: 'sm-user-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatDivider, MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, RouterLink, SmLabelPipe],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss',
})
export class UserMenu {
  protected readonly session = inject(SessionService);
  protected readonly items = USER_MENU_ITEMS;

  protected logout(): void {
    void this.session.logout();
  }
}
