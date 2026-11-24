import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AHORA, TOKEN_CAMBIO_PENDIENTE, TOKEN_ESTUDIANTE } from '../../../testing/sesion';
import { API_URL } from '../../api/api-url';
import { Rol, TokenResponse } from '../../api/models';
import { rutaDeInicio } from './inicio-rol';
import { RELOJ } from './reloj';
import { CLAVE_SESION, SesionService } from './sesion-service';

describe('rutaDeInicio (§2.2 de los requerimientos)', () => {
  let ahora: number;

  beforeEach(() => {
    sessionStorage.clear();
    ahora = AHORA;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.prueba/api/v1' },
        { provide: RELOJ, useValue: () => ahora },
      ],
    });
  });

  const con = (token: TokenResponse, rol: Rol = token.rol) => {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ ...token, rol, nombre: null }));
    return rutaDeInicio(TestBed.inject(SesionService));
  };

  it('sin sesión, la oferta académica', () => {
    expect(rutaDeInicio(TestBed.inject(SesionService))).toBe('/oferta');
  });

  it.each<[Rol, string]>([
    ['Estudiante', '/mis-matriculas'],
    ['Profesor', '/mis-grupos'],
    ['Administrador', '/grupos'],
  ])('%s: %s', (rol, ruta) => {
    expect(con(TOKEN_ESTUDIANTE, rol)).toBe(ruta);
  });

  it('con un cambio pendiente, el cambio obligatorio (RN-24)', () => {
    expect(con(TOKEN_CAMBIO_PENDIENTE, 'Administrador')).toBe('/cambio-obligatorio');
  });

  it('con la sesión vencida, la oferta', () => {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ ...TOKEN_ESTUDIANTE, nombre: null }));
    const sesion = TestBed.inject(SesionService);
    ahora = Date.parse(TOKEN_ESTUDIANTE.expiraEn);
    expect(rutaDeInicio(sesion)).toBe('/oferta');
  });
});
