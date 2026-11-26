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
import { NotFound } from './not-found/not-found';
import { Forbidden } from './forbidden/forbidden';

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

  const withSession = (token: TokenResponse, rol: Rol = token.rol) =>
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...token, rol, nombre: null }));

  function render(page: Type<unknown>) {
    const fixture = TestBed.createComponent(page);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const link = root.querySelector('a');
    return {
      heading: root.querySelector('h1')?.textContent?.trim(),
      links: root.querySelectorAll('a').length,
      text: link?.textContent?.trim(),
      path: link?.getAttribute('href'),
    };
  }

  it('V-09 avisa que no tiene permiso, con un único enlace a su página de inicio', () => {
    withSession(ESTUDIANTE_TOKEN, 'Profesor');
    expect(render(Forbidden)).toEqual({
      heading: 'No tiene permiso para ver esta página',
      links: 1,
      text: 'Ir a Mis grupos',
      path: '/mis-grupos',
    });
  });

  it('V-10 avisa que la dirección no existe', () => {
    expect(render(NotFound).heading).toBe('No encontramos esta página');
  });

  it.each<[string, () => void, string, string]>([
    ['el visitante', () => undefined, 'Ir a la oferta académica', '/oferta'],
    ['el estudiante', () => withSession(ESTUDIANTE_TOKEN), 'Ir a Mis matrículas', '/mis-matriculas'],
    ['el profesor', () => withSession(ESTUDIANTE_TOKEN, 'Profesor'), 'Ir a Mis grupos', '/mis-grupos'],
    ['el administrador', () => withSession(ESTUDIANTE_TOKEN, 'Administrador'), 'Ir a Grupos', '/grupos'],
    [
      'un cambio pendiente',
      () => withSession(PASSWORD_CHANGE_TOKEN),
      'Ir al cambio de contraseña',
      '/cambio-obligatorio',
    ],
  ])('V-10 lleva a %s a su página de inicio', (_case, prepare, text, path) => {
    prepare();
    const page = render(NotFound);
    expect(page.text).toBe(text);
    expect(page.path).toBe(path);
  });
});
