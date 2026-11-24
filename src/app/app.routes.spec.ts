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

  const conSesion = (token: TokenResponse, rol: Rol = token.rol) =>
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...token, rol, nombre: null }));

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
      ['el estudiante, Mis matrículas', () => conSesion(ESTUDIANTE_TOKEN), '/mis-matriculas'],
      ['el profesor, Mis grupos', () => conSesion(ESTUDIANTE_TOKEN, 'Profesor'), '/mis-grupos'],
      ['el administrador, Grupos', () => conSesion(ESTUDIANTE_TOKEN, 'Administrador'), '/grupos'],
      ['con un cambio pendiente, el cambio obligatorio', () => conSesion(PASSWORD_CHANGE_TOKEN), '/cambio-obligatorio'],
    ])('%s', async (_caso, preparar, destino) => {
      preparar();
      expect((await ir('/')).url).toBe(destino);
    });
  });

  it('una dirección que no existe muestra V-10 sin cambiar la dirección', async () => {
    expect(await ir('/no/existe?x=1')).toEqual({ url: '/no/existe?x=1', titulo: 'No encontramos esta página' });
  });

  it('/sin-permiso con sesión muestra V-09', async () => {
    conSesion(ESTUDIANTE_TOKEN);
    expect(await ir('/sin-permiso')).toEqual({
      url: '/sin-permiso',
      titulo: 'No tiene permiso para ver esta página',
    });
  });

  it('/sin-permiso sin sesión lleva al inicio de sesión', async () => {
    expect((await ir('/sin-permiso')).url).toBe('/iniciar-sesion?volver=%2Fsin-permiso');
  });
});
