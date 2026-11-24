import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AHORA, TOKEN_ESTUDIANTE } from '../../../testing/sesion';
import { API_URL } from '../../api/api-url';
import { RELOJ } from '../sesion/reloj';
import { CLAVE_SESION } from '../sesion/sesion-service';
import { tokenInterceptor } from './token-interceptor';

const API = 'http://api.prueba/api/v1';

describe('tokenInterceptor (§4.2)', () => {
  const configurar = (conSesion: boolean) => {
    sessionStorage.clear();
    if (conSesion) sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ ...TOKEN_ESTUDIANTE, nombre: null }));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_URL, useValue: API },
        { provide: RELOJ, useValue: () => AHORA },
      ],
    });
  };

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  const autorizacion = (url: string) => {
    void firstValueFrom(TestBed.inject(HttpClient).get(url)).catch(() => undefined);
    const peticion = TestBed.inject(HttpTestingController).expectOne(url);
    peticion.flush({});
    return peticion.request.headers.get('Authorization');
  };

  it('agrega el token a las peticiones a API_URL', () => {
    configurar(true);
    expect(autorizacion(`${API}/me`)).toBe('Bearer token-estudiante');
    expect(autorizacion(`${API}/cursos?page=2`)).toBe('Bearer token-estudiante');
  });

  it.each([
    ['otro origen', 'https://otro.sitio/api/v1/me'],
    ['un prefijo parecido a la API', `${API}-falsa/me`],
    ['un archivo del propio sitio', '/iconos/buscar.svg'],
  ])('no lo envía a %s', (_caso, url) => {
    configurar(true);
    expect(autorizacion(url)).toBeNull();
  });

  it('sin sesión no agrega nada', () => {
    configurar(false);
    expect(autorizacion(`${API}/me`)).toBeNull();
  });
});
