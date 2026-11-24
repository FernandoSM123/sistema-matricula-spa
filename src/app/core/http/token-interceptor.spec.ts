import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NOW, ESTUDIANTE_TOKEN } from '../../../testing/session';
import { API_URL } from '../../api/api-url';
import { CLOCK } from '../session/clock';
import { SESSION_KEY } from '../session/session-service';
import { tokenInterceptor } from './token-interceptor';

const API = 'http://api.prueba/api/v1';

describe('tokenInterceptor (§4.2)', () => {
  const configure = (withSession: boolean) => {
    sessionStorage.clear();
    if (withSession) sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...ESTUDIANTE_TOKEN, nombre: null }));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_URL, useValue: API },
        { provide: CLOCK, useValue: () => NOW },
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
});
