import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { AHORA, TOKEN_CAMBIO_PENDIENTE, TOKEN_ESTUDIANTE } from '../../../testing/sesion';
import { API_URL } from '../../api/api-url';
import { Rol, TokenResponse } from '../../api/models';
import { RELOJ } from '../sesion/reloj';
import { CLAVE_SESION, SesionService } from '../sesion/sesion-service';
import { cambioPendienteGuard } from './cambio-pendiente-guard';
import { invitadoGuard } from './invitado-guard';
import { rolGuard } from './rol-guard';
import { sesionGuard } from './sesion-guard';

@Component({ template: '' })
class Vista {}

const RUTAS_PRUEBA: Routes = [
  { path: 'oferta', component: Vista },
  { path: 'iniciar-sesion', canActivate: [invitadoGuard], component: Vista },
  { path: 'cambio-obligatorio', canActivate: [cambioPendienteGuard], component: Vista },
  { path: 'sin-permiso', canActivate: [sesionGuard], component: Vista },
  { path: 'mi-perfil', canActivate: [sesionGuard], component: Vista },
  { path: 'mis-matriculas', canActivate: [rolGuard('Estudiante')], component: Vista },
  { path: 'grupos', canActivate: [rolGuard('Administrador')], component: Vista },
  { path: 'grupos/:id', canActivate: [rolGuard('Administrador', 'Profesor', 'Estudiante')], component: Vista },
  // Un área de un solo rol, protegida con canMatch (§2.5).
  { path: 'auditoria', canMatch: [rolGuard('Administrador')], component: Vista },
];

describe('guardas (§4.3)', () => {
  let ahora: number;

  beforeEach(() => {
    sessionStorage.clear();
    ahora = AHORA;
    TestBed.configureTestingModule({
      providers: [
        provideRouter(RUTAS_PRUEBA),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.prueba/api/v1' },
        { provide: RELOJ, useValue: () => ahora },
      ],
    });
  });

  const guardar = (token: TokenResponse, rol: Rol = token.rol) =>
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ ...token, rol, nombre: null }));
  /** La sesión vence durante el uso: el servicio ya existe. Al arrancar, la vencida se descarta sin aviso (§4.1). */
  const vencer = () => {
    TestBed.inject(SesionService);
    ahora = Date.parse(TOKEN_ESTUDIANTE.expiraEn) + 1;
  };

  /** Navega y devuelve la ruta y los parámetros donde quedó. */
  async function ir(url: string) {
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    const arbol = router.parseUrl(router.url);
    const ruta = '/' + (arbol.root.children['primary']?.segments.map((s) => s.path).join('/') ?? '');
    return { ruta, parametros: arbol.queryParams };
  }

  describe('sesionGuard', () => {
    it('sin sesión: al inicio de sesión, con la ruta pedida en volver', async () => {
      expect(await ir('/mi-perfil')).toEqual({ ruta: '/iniciar-sesion', parametros: { volver: '/mi-perfil' } });
    });

    it('con la sesión vencida según expiraEn: además el aviso de RFF-03, y la descarta', async () => {
      guardar(TOKEN_ESTUDIANTE);
      vencer();
      expect(await ir('/mi-perfil')).toEqual({
        ruta: '/iniciar-sesion',
        parametros: { volver: '/mi-perfil', aviso: 'sesion-terminada' },
      });
      expect(TestBed.inject(SesionService).terminada()).toBe(true);
    });

    it('con un cambio pendiente (RN-24): al cambio obligatorio', async () => {
      guardar(TOKEN_CAMBIO_PENDIENTE);
      expect((await ir('/mi-perfil')).ruta).toBe('/cambio-obligatorio');
    });

    it('con sesión: deja pasar', async () => {
      guardar(TOKEN_ESTUDIANTE);
      expect((await ir('/mi-perfil')).ruta).toBe('/mi-perfil');
    });
  });

  describe('rolGuard', () => {
    it('con el rol: deja pasar y conserva los parámetros', async () => {
      guardar(TOKEN_ESTUDIANTE, 'Administrador');
      expect(await ir('/grupos?page=2')).toEqual({ ruta: '/grupos', parametros: { page: '2' } });
    });

    it('con otro rol: a V-09', async () => {
      guardar(TOKEN_ESTUDIANTE);
      expect((await ir('/grupos')).ruta).toBe('/sin-permiso');
    });

    it('sin sesión: al inicio de sesión con volver, también en una ruta con parámetros', async () => {
      expect(await ir('/grupos/5?pestana=horario')).toEqual({
        ruta: '/iniciar-sesion',
        parametros: { volver: '/grupos/5?pestana=horario' },
      });
    });

    it('con un cambio pendiente: al cambio obligatorio, antes de revisar el rol', async () => {
      guardar(TOKEN_CAMBIO_PENDIENTE);
      expect((await ir('/grupos')).ruta).toBe('/cambio-obligatorio');
    });

    describe('como canMatch de un área de un solo rol (§2.5)', () => {
      it('con el rol: deja pasar', async () => {
        guardar(TOKEN_ESTUDIANTE, 'Administrador');
        expect((await ir('/auditoria')).ruta).toBe('/auditoria');
      });

      it('con otro rol: a V-09', async () => {
        guardar(TOKEN_ESTUDIANTE, 'Profesor');
        expect((await ir('/auditoria')).ruta).toBe('/sin-permiso');
      });

      it('sin sesión: al inicio de sesión, con la dirección completa en volver', async () => {
        expect(await ir('/auditoria?entidad=Curso&page=3')).toEqual({
          ruta: '/iniciar-sesion',
          parametros: { volver: '/auditoria?entidad=Curso&page=3' },
        });
      });
    });
  });

  describe('invitadoGuard', () => {
    it('sin sesión: deja pasar', async () => {
      expect((await ir('/iniciar-sesion')).ruta).toBe('/iniciar-sesion');
    });

    it('con sesión: a la página de inicio del rol', async () => {
      guardar(TOKEN_ESTUDIANTE);
      expect((await ir('/iniciar-sesion')).ruta).toBe('/mis-matriculas');
    });

    it('con un cambio pendiente: al cambio obligatorio', async () => {
      guardar(TOKEN_CAMBIO_PENDIENTE);
      expect((await ir('/iniciar-sesion')).ruta).toBe('/cambio-obligatorio');
    });

    it('con la sesión vencida: la descarta y deja pasar', async () => {
      guardar(TOKEN_ESTUDIANTE);
      vencer();
      expect((await ir('/iniciar-sesion?volver=%2Fmi-perfil')).ruta).toBe('/iniciar-sesion');
      expect(TestBed.inject(SesionService).vencida()).toBe(false);
      TestBed.tick();
      expect(sessionStorage.getItem(CLAVE_SESION)).toBeNull();
    });
  });

  describe('cambioPendienteGuard', () => {
    it('con un cambio pendiente: deja pasar', async () => {
      guardar(TOKEN_CAMBIO_PENDIENTE);
      expect((await ir('/cambio-obligatorio')).ruta).toBe('/cambio-obligatorio');
    });

    it('sin un cambio pendiente: a la página de inicio del rol', async () => {
      guardar(TOKEN_ESTUDIANTE, 'Administrador');
      expect((await ir('/cambio-obligatorio')).ruta).toBe('/grupos');
    });

    it('sin sesión: al inicio de sesión', async () => {
      expect(await ir('/cambio-obligatorio')).toEqual({ ruta: '/iniciar-sesion', parametros: {} });
    });

    it('con la sesión vencida: al inicio de sesión con el aviso de RFF-03', async () => {
      guardar(TOKEN_CAMBIO_PENDIENTE);
      vencer();
      expect(await ir('/cambio-obligatorio')).toEqual({
        ruta: '/iniciar-sesion',
        parametros: { aviso: 'sesion-terminada' },
      });
    });
  });
});
