import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NOW, ESTUDIANTE_TOKEN, PASSWORD_CHANGE_TOKEN } from '../../../testing/session';
import { API_URL } from '../../api/api-url';
import { NO_SESSION } from '../../api/http-context';
import { TokenResponse } from '../../api/models';
import { CLOCK } from '../session/clock';
import { SESSION_KEY } from '../session/session-service';
import { tokenInterceptor } from './token-interceptor';

const API = 'http://api.prueba/api/v1';

describe('tokenInterceptor (§4.2)', () => {
  let now: number;

  const configure = (withSession: boolean, token: TokenResponse = ESTUDIANTE_TOKEN) => {
    sessionStorage.clear();
    now = NOW;
    if (withSession) sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...token, nombre: null }));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_URL, useValue: API },
        { provide: CLOCK, useValue: () => now },
      ],
    });
  };

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  const authorization = (url: string) => {
    void firstValueFrom(TestBed.inject(HttpClient).get(url)).catch(() => undefined);
    const request = TestBed.inject(HttpTestingController).expectOne(url);
    request.flush({});
    return request.request.headers.get('Authorization');
  };

  it('agrega el token a las peticiones a API_URL', () => {
    configure(true);
    expect(authorization(`${API}/me`)).toBe('Bearer token-estudiante');
    expect(authorization(`${API}/cursos?page=2`)).toBe('Bearer token-estudiante');
  });

  it.each([
    ['otro origen', 'https://otro.sitio/api/v1/me'],
    ['un prefijo parecido a la API', `${API}-falsa/me`],
    ['un archivo del propio sitio', '/icons/search.svg'],
  ])('no lo envía a %s', (_case, url) => {
    configure(true);
    expect(authorization(url)).toBeNull();
  });

  it('sin sesión no agrega nada', () => {
    configure(false);
    expect(authorization(`${API}/me`)).toBeNull();
  });

  it('no agrega el token a una petición marcada con NO_SESSION (la renovación)', () => {
    configure(true);
    const context = new HttpContext().set(NO_SESSION, true);
    void firstValueFrom(TestBed.inject(HttpClient).post(`${API}/auth/refresh`, {}, { context })).catch(() => undefined);
    const request = TestBed.inject(HttpTestingController).expectOne(`${API}/auth/refresh`);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  describe('con el token de acceso vencido (RF-60)', () => {
    const ACCESS_END = Date.parse(ESTUDIANTE_TOKEN.expiraEn);
    const tick = () => new Promise((resolve) => setTimeout(resolve));
    const controller = () => TestBed.inject(HttpTestingController);

    it('renueva una sola vez y envía con el token nuevo', async () => {
      configure(true);
      now = ACCESS_END;
      const response = firstValueFrom(TestBed.inject(HttpClient).get(`${API}/me`));

      const refresh = controller().expectOne(`${API}/auth/refresh`);
      expect(refresh.request.headers.has('Authorization')).toBe(false);
      refresh.flush({ ...ESTUDIANTE_TOKEN, accessToken: 'token-renovado', expiraEn: '2026-03-05T19:15:00Z' });
      await tick();

      const request = controller().expectOne(`${API}/me`);
      expect(request.request.headers.get('Authorization')).toBe('Bearer token-renovado');
      request.flush({ ok: true });
      await expect(response).resolves.toEqual({ ok: true });
    });

    it('sin refresh token (temporal), envía con el token que tiene, sin renovar', async () => {
      configure(true, PASSWORD_CHANGE_TOKEN);
      now = ACCESS_END - 1000; // la sesión temporal termina en expiraEn: un segundo antes
      expect(authorization(`${API}/auth/cambio-obligatorio`)).toBe('Bearer token-temporal');
      controller().expectNone(`${API}/auth/refresh`);
    });

    it('si la renovación falla, envía igual con el token viejo y la respuesta sigue su camino', async () => {
      configure(true);
      now = ACCESS_END;
      void firstValueFrom(TestBed.inject(HttpClient).get(`${API}/me`)).catch(() => undefined);
      controller().expectOne(`${API}/auth/refresh`).flush(null, { status: 500, statusText: 'Error' });
      await tick();

      const request = controller().expectOne(`${API}/me`);
      expect(request.request.headers.get('Authorization')).toBe('Bearer token-estudiante');
      request.flush({});
    });
  });
});
