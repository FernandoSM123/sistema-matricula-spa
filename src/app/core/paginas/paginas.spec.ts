import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter } from '@angular/router';
import { NOW, PASSWORD_CHANGE_TOKEN, ESTUDIANTE_TOKEN } from '../../../testing/session';
import { API_URL } from '../../api/api-url';
import { Rol, TokenResponse } from '../../api/models';
import { CLOCK } from '../session/clock';
import { SESSION_KEY } from '../session/session-service';
import { NoEncontrada } from './no-encontrada/no-encontrada';
import { SinPermiso } from './sin-permiso/sin-permiso';

describe('páginas del sistema (V-09, V-10)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [MatIconTestingModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.prueba/api/v1' },
        { provide: CLOCK, useValue: () => NOW },
      ],
    });
  });

  const conSesion = (token: TokenResponse, rol: Rol = token.rol) =>
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...token, rol, nombre: null }));

  function mostrar(pagina: Type<unknown>) {
    const fixture = TestBed.createComponent(pagina);
    fixture.detectChanges();
    const raiz = fixture.nativeElement as HTMLElement;
    const enlace = raiz.querySelector('a');
    return {
      titulo: raiz.querySelector('h1')?.textContent?.trim(),
      enlaces: raiz.querySelectorAll('a').length,
      texto: enlace?.textContent?.trim(),
      ruta: enlace?.getAttribute('href'),
    };
  }

  it('V-09 avisa que no tiene permiso, con un único enlace a su página de inicio', () => {
    conSesion(ESTUDIANTE_TOKEN, 'Profesor');
    expect(mostrar(SinPermiso)).toEqual({
      titulo: 'No tiene permiso para ver esta página',
      enlaces: 1,
      texto: 'Ir a Mis grupos',
      ruta: '/mis-grupos',
    });
  });

  it('V-10 avisa que la dirección no existe', () => {
    expect(mostrar(NoEncontrada).titulo).toBe('No encontramos esta página');
  });

  it.each<[string, () => void, string, string]>([
    ['el visitante', () => undefined, 'Ir a la oferta académica', '/oferta'],
    ['el estudiante', () => conSesion(ESTUDIANTE_TOKEN), 'Ir a Mis matrículas', '/mis-matriculas'],
    ['el profesor', () => conSesion(ESTUDIANTE_TOKEN, 'Profesor'), 'Ir a Mis grupos', '/mis-grupos'],
    ['el administrador', () => conSesion(ESTUDIANTE_TOKEN, 'Administrador'), 'Ir a Grupos', '/grupos'],
    [
      'un cambio pendiente',
      () => conSesion(PASSWORD_CHANGE_TOKEN),
      'Ir al cambio de contraseña',
      '/cambio-obligatorio',
    ],
  ])('V-10 lleva a %s a su página de inicio', (_caso, preparar, texto, ruta) => {
    preparar();
    const pagina = mostrar(NoEncontrada);
    expect(pagina.texto).toBe(texto);
    expect(pagina.ruta).toBe(ruta);
  });
});
