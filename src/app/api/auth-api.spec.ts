import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ESTUDIANTE_TOKEN } from '../../testing/session';
import { API_URL } from './api-url';
import { AuthApi } from './auth-api';
import { NO_SESSION } from './http-context';

const API = 'http://api.prueba/api/v1';

describe('AuthApi', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: API }],
    });
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('refresh() envía el refresh token en el cuerpo, sin sesión, y devuelve el par nuevo (RF-60)', async () => {
    const response = firstValueFrom(TestBed.inject(AuthApi).refresh('refresh-viejo'));

    const request = TestBed.inject(HttpTestingController).expectOne(`${API}/auth/refresh`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ refreshToken: 'refresh-viejo' });
    expect(request.request.context.get(NO_SESSION)).toBe(true);
    request.flush(ESTUDIANTE_TOKEN);

    await expect(response).resolves.toEqual(ESTUDIANTE_TOKEN);
  });

  it('logout() es una petición con sesión', () => {
    void firstValueFrom(TestBed.inject(AuthApi).logout()).catch(() => undefined);

    const request = TestBed.inject(HttpTestingController).expectOne(`${API}/auth/logout`);
    expect(request.request.context.get(NO_SESSION)).toBe(false);
    request.flush(null, { status: 204, statusText: 'No Content' });
  });
});
