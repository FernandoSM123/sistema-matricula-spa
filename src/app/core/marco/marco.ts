import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { EtiquetaPipe } from '../../shared/formatos/etiqueta-pipe';
import { rutaDeInicio } from '../sesion/inicio-rol';
import { SesionService } from '../sesion/sesion-service';
import { menuDe } from './menu-opciones';
import { MenuCuenta } from './menu-cuenta/menu-cuenta';
import { Pie } from './pie/pie';

/** Desde este ancho el menú lateral queda fijo; por debajo se pliega (§6.4). */
export const ANCHO_MENU_FIJO = '(min-width: 960px)';

/**
 * Qué marco lleva la vista, según la sesión:
 * - `visitante`: los enlaces del visitante en la barra;
 * - `rol`: el menú lateral del rol y el menú de la cuenta;
 * - `cambio-pendiente`: solo "Cerrar sesión" (RFF-02, el marco "mínimo" del wireframe de V-03).
 */
export type VarianteMarco = 'visitante' | 'rol' | 'cambio-pendiente';

/** El marco de la aplicación (§6.1, wireframes): barra superior, menú, la vista y el pie (RUI-23). */
@Component({
  selector: 'sm-marco',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatToolbar,
    RouterLink,
    RouterLinkActive,
    MenuCuenta,
    Pie,
    EtiquetaPipe,
  ],
  templateUrl: './marco.html',
  styleUrl: './marco.scss',
})
export class Marco {
  protected readonly sesion = inject(SesionService);

  /** Pantalla ancha: menú lateral fijo y enlaces del visitante en la barra. */
  protected readonly ancho = toSignal(
    inject(BreakpointObserver)
      .observe(ANCHO_MENU_FIJO)
      .pipe(map((estado) => estado.matches)),
    { initialValue: false },
  );

  protected readonly variante = computed<VarianteMarco>(() => {
    if (this.sesion.token() === null) return 'visitante';
    return this.sesion.cambioPendiente() ? 'cambio-pendiente' : 'rol';
  });

  protected readonly menu = computed(() => menuDe(this.variante() === 'rol' ? this.sesion.rol() : null));
  protected readonly inicio = computed(() => rutaDeInicio(this.sesion));

  /** Hay menú lateral con el rol siempre, y con el visitante solo en pantallas angostas. */
  protected readonly conMenuLateral = computed(
    () => this.variante() === 'rol' || (this.variante() === 'visitante' && !this.ancho()),
  );
  protected readonly menuFijo = computed(() => this.variante() === 'rol' && this.ancho());

  private readonly lateral = viewChild(MatSidenav);

  protected alternarMenu(): void {
    void this.lateral()?.toggle();
  }

  constructor() {
    // En modo plegable, el menú se cierra al navegar: al elegir una opción o con Atrás.
    inject(Router)
      .events.pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (!this.menuFijo()) void this.lateral()?.close();
      });
  }

  protected cerrarSesion(): void {
    void this.sesion.cerrarSesion();
  }
}
