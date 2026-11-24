import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { EtiquetaPipe } from '../../../shared/formatos/etiqueta-pipe';
import { SessionService } from '../../session/session-service';
import { OPCIONES_CUENTA } from '../menu-opciones';

/**
 * El menú de la cuenta (§2.3 de los requerimientos): el nombre y el rol de quien inició sesión,
 * Mi perfil, Cambiar contraseña y Cerrar sesión (RFF-04).
 */
@Component({
  selector: 'sm-menu-cuenta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatDivider, MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, RouterLink, EtiquetaPipe],
  templateUrl: './menu-cuenta.html',
  styleUrl: './menu-cuenta.scss',
})
export class MenuCuenta {
  protected readonly sesion = inject(SessionService);
  protected readonly opciones = OPCIONES_CUENTA;

  protected cerrarSesion(): void {
    void this.sesion.logout();
  }
}
