import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PROBLEM_401, PROBLEM_403_RN24, PROBLEM_409_RN39, PROBLEM_500 } from '../../../testing/problem-details';
import { NOW, ESTUDIANTE_TOKEN } from '../../../testing/session';
import { API_URL } from '../../api/api-url';
import { ApiError } from '../../api/api-error';
import { CLOCK } from '../session/clock';
import { SESSION_KEY, SessionService } from '../session/session-service';
import { errorInterceptor, REQUEST_TIMEOUT } from './error-interceptor';
import { tokenInterceptor } from './token-interceptor';

const API = 'http://api.prueba/api/v1';

describe('errorInterceptor (§3.5, §4.2)', () => {
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...ESTUDIANTE_TOKEN, nombre: null }));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_URL, useValue: API },
        { provide: CLOCK, useValue: () => NOW },
      ],
    });
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'url', 'get').mockReturnValue('/grupos/5?pestana=horario');
    navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  const http = () => TestBed.inject(HttpClient);
  const controller = () => TestBed.inject(HttpTestingController);
  const session = () => TestBed.inject(SessionService);

  /** Hace la petición, responde con el error y devuelve lo que recibe quien la hizo. */
  async function fail(status: number, body: object, url = `${API}/grupos/5`): Promise<unknown> {
    const result = firstValueFrom(http().get(url)).catch((e: unknown) => e);
    controller().expectOne(url).flush(body, { status, statusText: 'Error' });
    return result;
  }

  it('fija el tiempo de espera de 30 s en las peticiones a la API (§3.1)', () => {
    void firstValueFrom(http().get(`${API}/cursos`)).catch(() => undefined);
    const request = controller().expectOne(`${API}/cursos`);
    expect(request.request.timeout).toBe(REQUEST_TIMEOUT);
    expect(REQUEST_TIMEOUT).toBe(30_000);
    request.flush([]);
  });

  it('respeta un tiempo de espera propio y no toca las peticiones a otros orígenes', () => {
    void firstValueFrom(http().get(`${API}/cursos`, { timeout: 5000 })).catch(() => undefined);
    void firstValueFrom(http().get('/iconos/buscar.svg')).catch(() => undefined);
    const api = controller().expectOne(`${API}/cursos`);
    const icon = controller().expectOne('/iconos/buscar.svg');
    expect(api.request.timeout).toBe(5000);
    expect(icon.request.timeout).toBeFalsy();
    api.flush([]);
    icon.flush('');
  });

  it('convierte el error en un ApiError', async () => {
    const error = (await fail(409, PROBLEM_409_RN39)) as ApiError;
    expect(error.name).toBe('ApiError');
    expect(error.status).toBe(409);
    expect(error.code).toBe('RN-39');
    expect(error.data).toEqual({ usuarioId: 12 });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('sin respuesta da status 0', async () => {
    const result = firstValueFrom(http().get(`${API}/cursos`)).catch((e: unknown) => e);
    controller().expectOne(`${API}/cursos`).error(new ProgressEvent('error'));
    expect(((await result) as ApiError).status).toBe(0);
  });

  it('deja los errores de otros orígenes como HttpErrorResponse', async () => {
    const result = firstValueFrom(http().get('/iconos/x.svg')).catch((e: unknown) => e);
    controller().expectOne('/iconos/x.svg').flush('', { status: 404, statusText: 'Not Found' });
    expect(await result).toBeInstanceOf(HttpErrorResponse);
  });

  describe('401 (RFF-03)', () => {
    it('con token: termina la sesión y abre V-02 con volver y el aviso', async () => {
      const error = (await fail(401, PROBLEM_401)) as ApiError;

      expect(error.status).toBe(401);
      expect(session().isActive()).toBe(false);
      expect(session().ended()).toBe(true);
      expect(navigate).toHaveBeenCalledExactlyOnceWith(['/iniciar-sesion'], {
        queryParams: { volver: '/grupos/5?pestana=horario', aviso: 'sesion-terminada' },
      });
    });

    it('sin token (credenciales inválidas en el login) no navega', async () => {
      session().end();
      const error = (await fail(401, PROBLEM_401, `${API}/auth/login`)) as ApiError;
      expect(error.status).toBe(401);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('varios 401 a la vez navegan una sola vez', async () => {
      const a = firstValueFrom(http().get(`${API}/a`)).catch((e: unknown) => e);
      const b = firstValueFrom(http().get(`${API}/b`)).catch((e: unknown) => e);
      controller().expectOne(`${API}/a`).flush(PROBLEM_401, { status: 401, statusText: 'Unauthorized' });
      controller().expectOne(`${API}/b`).flush(PROBLEM_401, { status: 401, statusText: 'Unauthorized' });
      await Promise.all([a, b]);
      expect(navigate).toHaveBeenCalledTimes(1);
    });

    it('el 401 del logout después de logout() no abre V-02 (RFF-04)', async () => {
      const navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      const cierre = session().logout();
      const logout = controller().expectOne(`${API}/auth/logout`);
      expect(logout.request.headers.get('Authorization')).toBe('Bearer token-estudiante');
      logout.flush(PROBLEM_401, { status: 401, statusText: 'Unauthorized' });
      await cierre;

      expect(navigate).not.toHaveBeenCalled();
      expect(navigateByUrl).toHaveBeenCalledWith('/oferta?aviso=sesion-cerrada');
    });
  });

  it('403 RN-24: abre V-03 (RFF-02)', async () => {
    const error = (await fail(403, PROBLEM_403_RN24)) as ApiError;
    expect(error.code).toBe('RN-24');
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/cambio-obligatorio']);
  });

  it.each([
    ['403 sin code', 403, { status: 403 }],
    ['403 RN-18', 403, { status: 403, code: 'RN-18', detail: 'No tiene acceso.' }],
    ['404', 404, { status: 404, detail: 'El grupo no existe.' }],
    ['500', 500, PROBLEM_500],
  ])('%s: no navega, la vista lo presenta', async (_case, status, body) => {
    const error = (await fail(status, body)) as ApiError;
    expect(error.status).toBe(status);
    expect(navigate).not.toHaveBeenCalled();
    expect(session().isActive()).toBe(true);
  });
});
