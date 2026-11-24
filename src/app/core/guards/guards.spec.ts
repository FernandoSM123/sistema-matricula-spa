import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { NOW, PASSWORD_CHANGE_TOKEN, ESTUDIANTE_TOKEN } from '../../../testing/session';
import { API_URL } from '../../api/api-url';
import { Rol, TokenResponse } from '../../api/models';
import { CLOCK } from '../session/clock';
import { SESSION_KEY, SessionService } from '../session/session-service';
import { passwordChangeGuard } from './password-change-guard';
import { guestGuard } from './guest-guard';
import { rolGuard } from './rol-guard';
import { authGuard } from './auth-guard';

@Component({ template: '' })
class View {}

const TEST_ROUTES: Routes = [
  { path: 'oferta', component: View },
  { path: 'iniciar-sesion', canActivate: [guestGuard], component: View },
  { path: 'cambio-obligatorio', canActivate: [passwordChangeGuard], component: View },
  { path: 'sin-permiso', canActivate: [authGuard], component: View },
  { path: 'mi-perfil', canActivate: [authGuard], component: View },
  { path: 'mis-matriculas', canActivate: [rolGuard('Estudiante')], component: View },
  { path: 'grupos', canActivate: [rolGuard('Administrador')], component: View },
  { path: 'grupos/:id', canActivate: [rolGuard('Administrador', 'Profesor', 'Estudiante')], component: View },
  // Un área de un solo rol, protegida con canMatch (§2.5).
  { path: 'auditoria', canMatch: [rolGuard('Administrador')], component: View },
];

describe('guardas (§4.3)', () => {
  let now: number;

  beforeEach(() => {
    sessionStorage.clear();
    now = NOW;
    TestBed.configureTestingModule({
      providers: [
        provideRouter(TEST_ROUTES),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.prueba/api/v1' },
        { provide: CLOCK, useValue: () => now },
      ],
    });
  });

  const store = (token: TokenResponse, rol: Rol = token.rol) =>
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...token, rol, nombre: null }));
  /** La sesión vence durante el uso: el servicio ya existe. Al arrancar, la vencida se descarta sin aviso (§4.1). */
  const expire = () => {
    TestBed.inject(SessionService);
    now = Date.parse(ESTUDIANTE_TOKEN.expiraEn) + 1;
  };

  /** Navega y devuelve la ruta y los parámetros donde quedó. */
  async function go(url: string) {
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    const tree = router.parseUrl(router.url);
    const path = '/' + (tree.root.children['primary']?.segments.map((s) => s.path).join('/') ?? '');
    return { path, params: tree.queryParams };
  }

  describe('authGuard', () => {
    it('sin sesión: al inicio de sesión, con la ruta pedida en volver', async () => {
      expect(await go('/mi-perfil')).toEqual({ path: '/iniciar-sesion', params: { volver: '/mi-perfil' } });
    });

    it('con la sesión vencida según expiraEn: además el aviso de RFF-03, y la descarta', async () => {
      store(ESTUDIANTE_TOKEN);
      expire();
      expect(await go('/mi-perfil')).toEqual({
        path: '/iniciar-sesion',
        params: { volver: '/mi-perfil', aviso: 'sesion-terminada' },
      });
      expect(TestBed.inject(SessionService).ended()).toBe(true);
    });

    it('con un cambio pendiente (RN-24): al cambio obligatorio', async () => {
      store(PASSWORD_CHANGE_TOKEN);
      expect((await go('/mi-perfil')).path).toBe('/cambio-obligatorio');
    });

    it('con sesión: deja pasar', async () => {
      store(ESTUDIANTE_TOKEN);
      expect((await go('/mi-perfil')).path).toBe('/mi-perfil');
    });
  });

  describe('rolGuard', () => {
    it('con el rol: deja pasar y conserva los parámetros', async () => {
      store(ESTUDIANTE_TOKEN, 'Administrador');
      expect(await go('/grupos?page=2')).toEqual({ path: '/grupos', params: { page: '2' } });
    });

    it('con otro rol: a V-09', async () => {
      store(ESTUDIANTE_TOKEN);
      expect((await go('/grupos')).path).toBe('/sin-permiso');
    });

    it('sin sesión: al inicio de sesión con volver, también en una ruta con parámetros', async () => {
      expect(await go('/grupos/5?pestana=horario')).toEqual({
        path: '/iniciar-sesion',
        params: { volver: '/grupos/5?pestana=horario' },
      });
    });

    it('con un cambio pendiente: al cambio obligatorio, antes de revisar el rol', async () => {
      store(PASSWORD_CHANGE_TOKEN);
      expect((await go('/grupos')).path).toBe('/cambio-obligatorio');
    });

    describe('como canMatch de un área de un solo rol (§2.5)', () => {
      it('con el rol: deja pasar', async () => {
        store(ESTUDIANTE_TOKEN, 'Administrador');
        expect((await go('/auditoria')).path).toBe('/auditoria');
      });

      it('con otro rol: a V-09', async () => {
        store(ESTUDIANTE_TOKEN, 'Profesor');
        expect((await go('/auditoria')).path).toBe('/sin-permiso');
      });

      it('sin sesión: al inicio de sesión, con la dirección completa en volver', async () => {
        expect(await go('/auditoria?entidad=Curso&page=3')).toEqual({
          path: '/iniciar-sesion',
          params: { volver: '/auditoria?entidad=Curso&page=3' },
        });
      });
    });
  });

  describe('guestGuard', () => {
    it('sin sesión: deja pasar', async () => {
      expect((await go('/iniciar-sesion')).path).toBe('/iniciar-sesion');
    });

    it('con sesión: a la página de inicio del rol', async () => {
      store(ESTUDIANTE_TOKEN);
      expect((await go('/iniciar-sesion')).path).toBe('/mis-matriculas');
    });

    it('con un cambio pendiente: al cambio obligatorio', async () => {
      store(PASSWORD_CHANGE_TOKEN);
      expect((await go('/iniciar-sesion')).path).toBe('/cambio-obligatorio');
    });

    it('con la sesión vencida: la descarta y deja pasar', async () => {
      store(ESTUDIANTE_TOKEN);
      expire();
      expect((await go('/iniciar-sesion?volver=%2Fmi-perfil')).path).toBe('/iniciar-sesion');
      expect(TestBed.inject(SessionService).isExpired()).toBe(false);
      TestBed.tick();
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    });
  });

  describe('passwordChangeGuard', () => {
    it('con un cambio pendiente: deja pasar', async () => {
      store(PASSWORD_CHANGE_TOKEN);
      expect((await go('/cambio-obligatorio')).path).toBe('/cambio-obligatorio');
    });

    it('sin un cambio pendiente: a la página de inicio del rol', async () => {
      store(ESTUDIANTE_TOKEN, 'Administrador');
      expect((await go('/cambio-obligatorio')).path).toBe('/grupos');
    });

    it('sin sesión: al inicio de sesión', async () => {
      expect(await go('/cambio-obligatorio')).toEqual({ path: '/iniciar-sesion', params: {} });
    });

    it('con la sesión vencida: al inicio de sesión con el aviso de RFF-03', async () => {
      store(PASSWORD_CHANGE_TOKEN);
      expire();
      expect(await go('/cambio-obligatorio')).toEqual({
        path: '/iniciar-sesion',
        params: { aviso: 'sesion-terminada' },
      });
    });
  });
});
