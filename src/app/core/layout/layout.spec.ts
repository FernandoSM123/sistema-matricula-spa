import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { NOW, PASSWORD_CHANGE_TOKEN, ESTUDIANTE_TOKEN } from '../../../testing/session';
import { API_URL } from '../../api/api-url';
import { Rol, TokenResponse } from '../../api/models';
import { CLOCK } from '../session/clock';
import { SESSION_KEY } from '../session/session-service';
import { Layout } from './layout';
import { navFor } from './nav-items';

const API = 'http://api.prueba/api/v1';

describe('Layout (§6.1, RUI-23)', () => {
  async function create(options: { wide?: boolean; token?: TokenResponse; rol?: Rol; nombre?: string | null } = {}) {
    sessionStorage.clear();
    if (options.token) {
      const { token, rol = token.rol, nombre = null } = options;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...token, rol, nombre }));
    }
    const state: BreakpointState = { matches: options.wide ?? true, breakpoints: {} };
    TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      imports: [Layout, MatIconTestingModule],
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: API },
        { provide: CLOCK, useValue: () => NOW },
        { provide: BreakpointObserver, useValue: { observe: () => of(state) } },
      ],
    });
    const fixture = TestBed.createComponent(Layout);
    fixture.detectChanges();
    for (const block of await fixture.getDeferBlocks()) await block.render(DeferBlockState.Complete);
    const root = fixture.nativeElement as HTMLElement;
    const texts = (selector: string) => Array.from(root.querySelectorAll(selector), (e) => e.textContent?.trim() ?? '');
    return { fixture, root, texts };
  }

  describe('visitante', () => {
    it('en pantalla ancha, los enlaces en la barra y sin menú lateral', async () => {
      const { root, texts } = await create();
      expect(texts('.toolbar nav a')).toEqual(['Oferta académica', 'Iniciar sesión', 'Registrarse']);
      expect(root.querySelector('mat-sidenav')?.classList).toContain('hidden');
      expect(root.querySelector('.menu-button')).toBeNull();
      expect(root.querySelector('sm-user-menu')).toBeNull();
    });

    it('en celular, los mismos enlaces en el menú plegable', async () => {
      const { root, texts } = await create({ wide: false });
      expect(root.querySelector('.toolbar nav')).toBeNull();
      expect(root.querySelector('.menu-button')).not.toBeNull();
      expect(texts('mat-sidenav a')).toEqual(['Oferta académica', 'Iniciar sesión', 'Registrarse']);
    });
  });

  describe('con rol', () => {
    it('el estudiante ve su menú lateral fijo y el menú de la cuenta, sin enlaces del visitante', async () => {
      const { root, texts } = await create({ token: ESTUDIANTE_TOKEN, nombre: 'María Fernanda Quesada Rojas' });
      expect(texts('mat-sidenav a')).toEqual(['Mis matrículas', 'Mi horario', 'Oferta académica', 'Cursos']);
      expect(root.querySelector('mat-sidenav')?.classList).not.toContain('hidden');
      expect(root.querySelector('.menu-button')).toBeNull();
      expect(root.querySelector('.toolbar nav')).toBeNull();
      expect(texts('.account .name')).toEqual(['María Fernanda Quesada Rojas']);
      expect(texts('.account .rol')).toEqual(['Estudiante']);
    });

    it('el administrador ve las secciones del menú (§2.3)', async () => {
      const { texts } = await create({ token: ESTUDIANTE_TOKEN, rol: 'Administrador' });
      expect(texts('mat-sidenav .section')).toEqual(['Académico', 'Personas', 'Sistema']);
      expect(texts('mat-sidenav a')).toHaveLength(10);
    });

    it('en celular, el menú se pliega y se abre con el botón', async () => {
      const { fixture, root } = await create({ token: ESTUDIANTE_TOKEN, wide: false });
      const button = root.querySelector<HTMLButtonElement>('.menu-button');
      expect(button?.getAttribute('aria-expanded')).toBe('false');
      button?.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(button?.getAttribute('aria-expanded')).toBe('true');
    });

    it('en celular, el menú se cierra al navegar', async () => {
      const { fixture, root } = await create({ token: ESTUDIANTE_TOKEN, wide: false });
      const button = root.querySelector<HTMLButtonElement>('.menu-button');
      button?.click();
      await fixture.whenStable();
      await TestBed.inject(Router).navigateByUrl('/mi-horario');
      await fixture.whenStable();
      fixture.detectChanges();
      expect(button?.getAttribute('aria-expanded')).toBe('false');
    });

    it('sin el nombre (GET /me falló), muestra solo el rol', async () => {
      const { texts } = await create({ token: ESTUDIANTE_TOKEN, rol: 'Profesor' });
      expect(texts('.account .name')).toEqual([]);
      expect(texts('.account .rol')).toEqual(['Profesor']);
    });

    it('el menú de la cuenta ofrece Mi perfil, Cambiar contraseña y Cerrar sesión', async () => {
      const { fixture, root } = await create({ token: ESTUDIANTE_TOKEN });
      root.querySelector<HTMLButtonElement>('.account')?.click();
      await fixture.whenStable();
      const items = Array.from(document.querySelectorAll('.mat-mdc-menu-item'), (e) => e.textContent?.trim());
      expect(items).toEqual(['Mi perfil', 'Cambiar contraseña', 'Cerrar sesión']);
    });

    it('"Cerrar sesión" llama al logout y lleva a la oferta con el aviso (RFF-04)', async () => {
      const { fixture, root } = await create({ token: ESTUDIANTE_TOKEN });
      root.querySelector<HTMLButtonElement>('.account')?.click();
      await fixture.whenStable();
      const logoutItem = Array.from(document.querySelectorAll<HTMLElement>('.mat-mdc-menu-item')).at(-1);
      logoutItem?.click();
      TestBed.inject(HttpTestingController).expectOne(`${API}/auth/logout`).flush(null);
      await fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe('/oferta?aviso=sesion-cerrada');
    });
  });

  it('con un cambio pendiente, solo "Cerrar sesión": sin menú ni enlace de inicio (RFF-02)', async () => {
    const { root, texts } = await create({ token: PASSWORD_CHANGE_TOKEN });
    expect(root.querySelector('mat-sidenav')?.classList).toContain('hidden');
    expect(root.querySelector('sm-user-menu')).toBeNull();
    expect(root.querySelector('a.app-name')).toBeNull();
    expect(texts('.toolbar button')).toEqual(['Cerrar sesión']);
  });

  it('el nombre del sistema lleva a la página de inicio del rol', async () => {
    const { root } = await create({ token: ESTUDIANTE_TOKEN, rol: 'Profesor' });
    expect(root.querySelector('a.app-name')?.getAttribute('href')).toBe('/mis-grupos');
  });

  it('el pie lleva el sistema, el instituto, el año en Costa Rica y la versión (RUI-23)', async () => {
    const { texts } = await create();
    const [identification, version] = texts('sm-footer span');
    expect(identification).toBe('Sistema de Matrícula · Instituto de Cursos Libres · © 2026');
    expect(version).toMatch(/^Versión \d+\.\d+\.\d+/);
  });
});

describe('navFor (§2.3)', () => {
  it('cada rol tiene su orden', async () => {
    const paths = (rol: Rol | null) => navFor(rol).flatMap((g) => g.items.map((o) => o.path));
    expect(paths(null)).toEqual(['/oferta', '/iniciar-sesion', '/registro']);
    expect(paths('Estudiante')).toEqual(['/mis-matriculas', '/mi-horario', '/oferta', '/cursos']);
    expect(paths('Profesor')).toEqual(['/mis-grupos', '/mi-horario', '/oferta', '/cursos', '/aulas']);
    expect(paths('Administrador')).toEqual([
      '/grupos',
      '/cursos',
      '/periodos',
      '/aulas',
      '/oferta',
      '/estudiantes',
      '/profesores',
      '/administradores',
      '/auditoria',
      '/errores',
    ]);
  });
});

describe('Layout: menú de la cuenta en diferido (§8.3)', () => {
  it('mientras carga muestra el rol, sin el menú', async () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...ESTUDIANTE_TOKEN, nombre: null }));
    TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      imports: [Layout, MatIconTestingModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: API },
        { provide: CLOCK, useValue: () => NOW },
      ],
    });
    const fixture = TestBed.createComponent(Layout);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.account-loading')?.textContent?.trim()).toBe('Estudiante');
    expect(root.querySelector('sm-user-menu')).toBeNull();
  });
});
