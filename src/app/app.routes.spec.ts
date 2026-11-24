import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AHORA, TOKEN_CAMBIO_PENDIENTE, TOKEN_ESTUDIANTE } from '../testing/sesion';
import { API_URL } from './api/api-url';
import { Rol, TokenResponse } from './api/modelos';
import { routes } from './app.routes';
import { RELOJ } from './core/sesion/reloj';
import { CLAVE_SESION } from './core/sesion/sesion-service';

describe('rutas de la aplicación (§2.4, §2.5)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [MatIconTestingModule],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.prueba/api/v1' },
        { provide: RELOJ, useValue: () => AHORA },
      ],
    });
  });

  const conSesion = (token: TokenResponse, rol: Rol = token.rol) =>
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ ...token, rol, nombre: null }));

  async function ir(url: string) {
    const harness = await RouterTestingHarness.create(url);
    return {
      url: TestBed.inject(Router).url,
      titulo: (harness.routeNativeElement?.querySelector('h1')?.textContent ?? '').trim(),
    };
  }

  describe('inicio (/)', () => {
    it.each<[string, () => void, string]>([
      ['sin sesión, la oferta', () => undefined, '/oferta'],
      ['el estudiante, Mis matrículas', () => conSesion(TOKEN_ESTUDIANTE), '/mis-matriculas'],
      ['el profesor, Mis grupos', () => conSesion(TOKEN_ESTUDIANTE, 'Profesor'), '/mis-grupos'],
      ['el administrador, Grupos', () => conSesion(TOKEN_ESTUDIANTE, 'Administrador'), '/grupos'],
      [
        'con un cambio pendiente, el cambio obligatorio',
        () => conSesion(TOKEN_CAMBIO_PENDIENTE),
        '/cambio-obligatorio',
      ],
    ])('%s', async (_caso, preparar, destino) => {
      preparar();
      expect((await ir('/')).url).toBe(destino);
    });
  });

  it('una dirección que no existe muestra V-10 sin cambiar la dirección', async () => {
    expect(await ir('/no/existe?x=1')).toEqual({ url: '/no/existe?x=1', titulo: 'No encontramos esta página' });
  });

  it('/sin-permiso con sesión muestra V-09', async () => {
    conSesion(TOKEN_ESTUDIANTE);
    expect(await ir('/sin-permiso')).toEqual({
      url: '/sin-permiso',
      titulo: 'No tiene permiso para ver esta página',
    });
  });

  it('/sin-permiso sin sesión lleva al inicio de sesión', async () => {
    expect((await ir('/sin-permiso')).url).toBe('/iniciar-sesion?volver=%2Fsin-permiso');
  });
});
