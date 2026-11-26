import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { NOW, PASSWORD_CHANGE_TOKEN, ESTUDIANTE_TOKEN } from '../testing/session';
import { API_URL } from './api/api-url';
import { Rol, TokenResponse } from './api/models';
import { routes } from './app.routes';
import { CLOCK } from './core/session/clock';
import { SESSION_KEY } from './core/session/session-service';

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
        { provide: CLOCK, useValue: () => NOW },
      ],
    });
  });

  const withSession = (token: TokenResponse, rol: Rol = token.rol) =>
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...token, rol, nombre: null }));

  async function go(url: string) {
    const harness = await RouterTestingHarness.create(url);
    return {
      url: TestBed.inject(Router).url,
      heading: (harness.routeNativeElement?.querySelector('h1')?.textContent ?? '').trim(),
    };
  }

  describe('inicio (/)', () => {
    it.each<[string, () => void, string]>([
      ['sin sesión, la oferta', () => undefined, '/oferta'],
      ['el estudiante, Mis matrículas', () => withSession(ESTUDIANTE_TOKEN), '/mis-matriculas'],
      ['el profesor, Mis grupos', () => withSession(ESTUDIANTE_TOKEN, 'Profesor'), '/mis-grupos'],
      ['el administrador, Grupos', () => withSession(ESTUDIANTE_TOKEN, 'Administrador'), '/grupos'],
      [
        'con un cambio pendiente, el cambio obligatorio',
        () => withSession(PASSWORD_CHANGE_TOKEN),
        '/cambio-obligatorio',
      ],
    ])('%s', async (_case, prepare, expected) => {
      prepare();
      expect((await go('/')).url).toBe(expected);
    });
  });

  it('una dirección que no existe muestra V-10 sin cambiar la dirección', async () => {
    expect(await go('/no/existe?x=1')).toEqual({ url: '/no/existe?x=1', heading: 'No encontramos esta página' });
  });

  it('/sin-permiso con sesión muestra V-09', async () => {
    withSession(ESTUDIANTE_TOKEN);
    expect(await go('/sin-permiso')).toEqual({
      url: '/sin-permiso',
      heading: 'No tiene permiso para ver esta página',
    });
  });

  it('/sin-permiso sin sesión lleva al inicio de sesión', async () => {
    expect((await go('/sin-permiso')).url).toBe('/iniciar-sesion?volver=%2Fsin-permiso');
  });
});
