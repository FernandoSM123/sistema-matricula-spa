import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NOW, PASSWORD_CHANGE_TOKEN, ESTUDIANTE_TOKEN } from '../../../testing/session';
import { API_URL } from '../../api/api-url';
import { Rol, TokenResponse } from '../../api/models';
import { homeRoute } from './home-route';
import { CLOCK } from './clock';
import { SESSION_KEY, SessionService } from './session-service';

describe('homeRoute (§2.2 de los requerimientos)', () => {
  let now: number;

  beforeEach(() => {
    sessionStorage.clear();
    now = NOW;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.prueba/api/v1' },
        { provide: CLOCK, useValue: () => now },
      ],
    });
  });

  const withSession = (token: TokenResponse, rol: Rol = token.rol) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...token, rol, nombre: null }));
    return homeRoute(TestBed.inject(SessionService));
  };

  it('sin sesión, la oferta académica', () => {
    expect(homeRoute(TestBed.inject(SessionService))).toBe('/oferta');
  });

  it.each<[Rol, string]>([
    ['Estudiante', '/mis-matriculas'],
    ['Profesor', '/mis-grupos'],
    ['Administrador', '/grupos'],
  ])('%s: %s', (rol, path) => {
    expect(withSession(ESTUDIANTE_TOKEN, rol)).toBe(path);
  });

  it('con un cambio pendiente, el cambio obligatorio (RN-24)', () => {
    expect(withSession(PASSWORD_CHANGE_TOKEN, 'Administrador')).toBe('/cambio-obligatorio');
  });

  it('con la sesión terminada, la oferta', () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...ESTUDIANTE_TOKEN, nombre: null }));
    const session = TestBed.inject(SessionService);
    now = Date.parse(ESTUDIANTE_TOKEN.refreshExpiraEn ?? '');
    expect(homeRoute(session)).toBe('/oferta');
  });
});
