import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { SmLabelPipe } from '../../shared/formatting/label-pipe';
import { homeRoute } from '../session/home-route';
import { SessionService } from '../session/session-service';
import { Footer } from './footer/footer';
import { navFor } from './nav-items';
import { UserMenu } from './user-menu/user-menu';

/** Desde este ancho el menú lateral queda fijo; por debajo se pliega (§6.4). */
export const FIXED_SIDENAV_QUERY = '(min-width: 960px)';

/**
 * Qué layout lleva la vista, según la sesión:
 * - `guest`: los enlaces del visitante en la barra;
 * - `rol`: el menú lateral del rol y el menú de la cuenta;
 * - `password-change`: solo "Cerrar sesión" (RFF-02, el marco "mínimo" del wireframe de V-03).
 */
export type LayoutVariant = 'guest' | 'rol' | 'password-change';

/** El layout de la aplicación (§6.1, wireframes): barra superior, menú, la vista y el pie (RUI-23). */
@Component({
  selector: 'sm-layout',
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
    UserMenu,
    Footer,
    SmLabelPipe,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  protected readonly session = inject(SessionService);

  /** Pantalla ancha: menú lateral fijo y enlaces del visitante en la barra. */
  protected readonly isWide = toSignal(
    inject(BreakpointObserver)
      .observe(FIXED_SIDENAV_QUERY)
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  protected readonly variant = computed<LayoutVariant>(() => {
    if (this.session.token() === null) return 'guest';
    return this.session.passwordChangePending() ? 'password-change' : 'rol';
  });

  protected readonly nav = computed(() => navFor(this.variant() === 'rol' ? this.session.rol() : null));
  protected readonly home = computed(() => homeRoute(this.session));

  /** Hay menú lateral con el rol siempre, y con el visitante solo en pantallas angostas. */
  protected readonly hasSidenav = computed(
    () => this.variant() === 'rol' || (this.variant() === 'guest' && !this.isWide()),
  );
  protected readonly fixedSidenav = computed(() => this.variant() === 'rol' && this.isWide());

  private readonly sidenav = viewChild(MatSidenav);

  protected toggleSidenav(): void {
    void this.sidenav()?.toggle();
  }

  constructor() {
    // En modo plegable, el menú se cierra al navegar: al elegir una opción o con Atrás.
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (!this.fixedSidenav()) void this.sidenav()?.close();
      });
  }

  protected logout(): void {
    void this.session.logout();
  }
}
