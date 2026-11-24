import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { AHORA, TOKEN_CAMBIO_PENDIENTE, TOKEN_ESTUDIANTE } from '../../../testing/sesion';
import { API_URL } from '../../api/api-url';
import { Rol, TokenResponse } from '../../api/modelos';
import { RELOJ } from '../sesion/reloj';
import { CLAVE_SESION } from '../sesion/sesion-service';
import { Marco } from './marco';
import { menuDe } from './menu-opciones';

const API = 'http://api.prueba/api/v1';

describe('Marco (§6.1, RUI-23)', () => {
  async function crear(opciones: { ancho?: boolean; token?: TokenResponse; rol?: Rol; nombre?: string | null } = {}) {
    sessionStorage.clear();
    if (opciones.token) {
      const { token, rol = token.rol, nombre = null } = opciones;
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ ...token, rol, nombre }));
    }
    const estado: BreakpointState = { matches: opciones.ancho ?? true, breakpoints: {} };
    TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      imports: [Marco, MatIconTestingModule],
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: API },
        { provide: RELOJ, useValue: () => AHORA },
        { provide: BreakpointObserver, useValue: { observe: () => of(estado) } },
      ],
    });
    const fixture = TestBed.createComponent(Marco);
    fixture.detectChanges();
    for (const bloque of await fixture.getDeferBlocks()) await bloque.render(DeferBlockState.Complete);
    const raiz = fixture.nativeElement as HTMLElement;
    const textos = (selector: string) =>
      Array.from(raiz.querySelectorAll(selector), (e) => e.textContent?.trim() ?? '');
    return { fixture, raiz, textos };
  }

  describe('visitante', () => {
    it('en pantalla ancha, los enlaces en la barra y sin menú lateral', async () => {
      const { raiz, textos } = await crear();
      expect(textos('.barra nav a')).toEqual(['Oferta académica', 'Iniciar sesión', 'Registrarse']);
      expect(raiz.querySelector('mat-sidenav')?.classList).toContain('oculto');
      expect(raiz.querySelector('.boton-menu')).toBeNull();
      expect(raiz.querySelector('sm-menu-cuenta')).toBeNull();
    });

    it('en celular, los mismos enlaces en el menú plegable', async () => {
      const { raiz, textos } = await crear({ ancho: false });
      expect(raiz.querySelector('.barra nav')).toBeNull();
      expect(raiz.querySelector('.boton-menu')).not.toBeNull();
      expect(textos('mat-sidenav a')).toEqual(['Oferta académica', 'Iniciar sesión', 'Registrarse']);
    });
  });

  describe('con rol', () => {
    it('el estudiante ve su menú lateral fijo y el menú de la cuenta, sin enlaces del visitante', async () => {
      const { raiz, textos } = await crear({ token: TOKEN_ESTUDIANTE, nombre: 'María Fernanda Quesada Rojas' });
      expect(textos('mat-sidenav a')).toEqual(['Mis matrículas', 'Mi horario', 'Oferta académica', 'Cursos']);
      expect(raiz.querySelector('mat-sidenav')?.classList).not.toContain('oculto');
      expect(raiz.querySelector('.boton-menu')).toBeNull();
      expect(raiz.querySelector('.barra nav')).toBeNull();
      expect(textos('.cuenta .nombre')).toEqual(['María Fernanda Quesada Rojas']);
      expect(textos('.cuenta .rol')).toEqual(['Estudiante']);
    });

    it('el administrador ve los grupos del menú (§2.3)', async () => {
      const { textos } = await crear({ token: TOKEN_ESTUDIANTE, rol: 'Administrador' });
      expect(textos('mat-sidenav .grupo')).toEqual(['Académico', 'Personas', 'Sistema']);
      expect(textos('mat-sidenav a')).toHaveLength(10);
    });

    it('en celular, el menú se pliega y se abre con el botón', async () => {
      const { fixture, raiz } = await crear({ token: TOKEN_ESTUDIANTE, ancho: false });
      const boton = raiz.querySelector<HTMLButtonElement>('.boton-menu');
      expect(boton?.getAttribute('aria-expanded')).toBe('false');
      boton?.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(boton?.getAttribute('aria-expanded')).toBe('true');
    });

    it('en celular, el menú se cierra al navegar', async () => {
      const { fixture, raiz } = await crear({ token: TOKEN_ESTUDIANTE, ancho: false });
      const boton = raiz.querySelector<HTMLButtonElement>('.boton-menu');
      boton?.click();
      await fixture.whenStable();
      await TestBed.inject(Router).navigateByUrl('/mi-horario');
      await fixture.whenStable();
      fixture.detectChanges();
      expect(boton?.getAttribute('aria-expanded')).toBe('false');
    });

    it('sin el nombre (GET /me falló), muestra solo el rol', async () => {
      const { textos } = await crear({ token: TOKEN_ESTUDIANTE, rol: 'Profesor' });
      expect(textos('.cuenta .nombre')).toEqual([]);
      expect(textos('.cuenta .rol')).toEqual(['Profesor']);
    });

    it('el menú de la cuenta ofrece Mi perfil, Cambiar contraseña y Cerrar sesión', async () => {
      const { fixture, raiz } = await crear({ token: TOKEN_ESTUDIANTE });
      raiz.querySelector<HTMLButtonElement>('.cuenta')?.click();
      await fixture.whenStable();
      const items = Array.from(document.querySelectorAll('.mat-mdc-menu-item'), (e) => e.textContent?.trim());
      expect(items).toEqual(['Mi perfil', 'Cambiar contraseña', 'Cerrar sesión']);
    });

    it('"Cerrar sesión" llama al logout y lleva a la oferta con el aviso (RFF-04)', async () => {
      const { fixture, raiz } = await crear({ token: TOKEN_ESTUDIANTE });
      raiz.querySelector<HTMLButtonElement>('.cuenta')?.click();
      await fixture.whenStable();
      const cerrar = Array.from(document.querySelectorAll<HTMLElement>('.mat-mdc-menu-item')).at(-1);
      cerrar?.click();
      TestBed.inject(HttpTestingController).expectOne(`${API}/auth/logout`).flush(null);
      await fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe('/oferta?aviso=sesion-cerrada');
    });
  });

  it('con un cambio pendiente, solo "Cerrar sesión": sin menú ni enlace de inicio (RFF-02)', async () => {
    const { raiz, textos } = await crear({ token: TOKEN_CAMBIO_PENDIENTE });
    expect(raiz.querySelector('mat-sidenav')?.classList).toContain('oculto');
    expect(raiz.querySelector('sm-menu-cuenta')).toBeNull();
    expect(raiz.querySelector('a.nombre-sistema')).toBeNull();
    expect(textos('.barra button')).toEqual(['Cerrar sesión']);
  });

  it('el nombre del sistema lleva a la página de inicio del rol', async () => {
    const { raiz } = await crear({ token: TOKEN_ESTUDIANTE, rol: 'Profesor' });
    expect(raiz.querySelector('a.nombre-sistema')?.getAttribute('href')).toBe('/mis-grupos');
  });

  it('el pie lleva el sistema, el instituto, el año en Costa Rica y la versión (RUI-23)', async () => {
    const { textos } = await crear();
    const [identificacion, version] = textos('sm-pie span');
    expect(identificacion).toBe('Sistema de Matrícula · Instituto de Cursos Libres · © 2026');
    expect(version).toMatch(/^Versión \d+\.\d+\.\d+/);
  });
});

describe('menuDe (§2.3)', () => {
  it('cada rol tiene su orden', async () => {
    const rutas = (rol: Rol | null) => menuDe(rol).flatMap((g) => g.opciones.map((o) => o.ruta));
    expect(rutas(null)).toEqual(['/oferta', '/iniciar-sesion', '/registro']);
    expect(rutas('Estudiante')).toEqual(['/mis-matriculas', '/mi-horario', '/oferta', '/cursos']);
    expect(rutas('Profesor')).toEqual(['/mis-grupos', '/mi-horario', '/oferta', '/cursos', '/aulas']);
    expect(rutas('Administrador')).toEqual([
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

describe('Marco: menú de la cuenta en diferido (§8.3)', () => {
  it('mientras carga muestra el rol, sin el menú', async () => {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ ...TOKEN_ESTUDIANTE, nombre: null }));
    TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      imports: [Marco, MatIconTestingModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: API },
        { provide: RELOJ, useValue: () => AHORA },
      ],
    });
    const fixture = TestBed.createComponent(Marco);
    fixture.detectChanges();
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.querySelector('.cuenta-cargando')?.textContent?.trim()).toBe('Estudiante');
    expect(raiz.querySelector('sm-menu-cuenta')).toBeNull();
  });
});
