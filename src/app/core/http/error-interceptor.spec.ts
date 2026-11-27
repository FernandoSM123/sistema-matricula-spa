import { HttpClient, HttpContext, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  PROBLEM_401,
  PROBLEM_401_RF60,
  PROBLEM_403_RN24,
  PROBLEM_409_RN39,
  PROBLEM_500,
} from '../../../testing/problem-details';
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

  const tick = () => new Promise((resolve) => setTimeout(resolve));
  const unauthorized = { status: 401, statusText: 'Unauthorized' };
  const RENEWED = { ...ESTUDIANTE_TOKEN, accessToken: 'token-renovado', expiraEn: '2026-03-05T19:15:00Z' };

  /** Responde la renovación que pidió un 401 (llega después de un ciclo de promesas). */
  async function answerRefresh(
    body: object,
    init: { status: number; statusText: string } = { status: 200, statusText: 'OK' },
  ) {
    await tick();
    const refresh = controller().expectOne(`${API}/auth/refresh`);
    expect(refresh.request.headers.has('Authorization')).toBe(false);
    refresh.flush(body, init);
    await tick();
  }

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
    void firstValueFrom(http().get('/icons/search.svg')).catch(() => undefined);
    const api = controller().expectOne(`${API}/cursos`);
    const icon = controller().expectOne('/icons/search.svg');
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
    const result = firstValueFrom(http().get('/icons/x.svg')).catch((e: unknown) => e);
    controller().expectOne('/icons/x.svg').flush('', { status: 404, statusText: 'Not Found' });
    expect(await result).toBeInstanceOf(HttpErrorResponse);
  });

  describe('401 con sesión: renueva y repite (RF-60)', () => {
    it('renueva, repite una vez con el token nuevo y entrega su respuesta', async () => {
      const result = firstValueFrom(http().get(`${API}/grupos/5`));
      controller().expectOne(`${API}/grupos/5`).flush(PROBLEM_401, unauthorized);
      await answerRefresh(RENEWED);

      const retry = controller().expectOne(`${API}/grupos/5`);
      expect(retry.request.headers.get('Authorization')).toBe('Bearer token-renovado');
      retry.flush({ id: 5 });

      await expect(result).resolves.toEqual({ id: 5 });
      expect(session().token()).toBe('token-renovado');
      expect(navigate).not.toHaveBeenCalled();
    });

    it('repite también un POST: el 401 significa que la API no lo ejecutó', async () => {
      const result = firstValueFrom(http().post(`${API}/matriculas`, { grupoId: 5 }));
      controller().expectOne(`${API}/matriculas`).flush(PROBLEM_401, unauthorized);
      await answerRefresh(RENEWED);

      const retry = controller().expectOne(`${API}/matriculas`);
      expect(retry.request.method).toBe('POST');
      expect(retry.request.body).toEqual({ grupoId: 5 });
      retry.flush({ id: 9 });
      await expect(result).resolves.toEqual({ id: 9 });
    });

    it('si la repetición vuelve a dar 401, aplica RFF-03 sin renovar otra vez', async () => {
      const result = firstValueFrom(http().get(`${API}/grupos/5`)).catch((e: unknown) => e);
      controller().expectOne(`${API}/grupos/5`).flush(PROBLEM_401, unauthorized);
      await answerRefresh(RENEWED);
      controller().expectOne(`${API}/grupos/5`).flush(PROBLEM_401, unauthorized);

      expect(((await result) as ApiError).status).toBe(401);
      controller().expectNone(`${API}/auth/refresh`);
      expect(session().ended()).toBe(true);
      expect(navigate).toHaveBeenCalledTimes(1);
    });

    it('no marca el HttpContext de quien hizo la petición: otra petición con el mismo contexto también renueva', async () => {
      const context = new HttpContext();
      const first = firstValueFrom(http().get(`${API}/a`, { context }));
      controller().expectOne(`${API}/a`).flush(PROBLEM_401, unauthorized);
      await answerRefresh(RENEWED);
      controller().expectOne(`${API}/a`).flush({});
      await first;

      const second = firstValueFrom(http().get(`${API}/b`, { context }));
      controller().expectOne(`${API}/b`).flush(PROBLEM_401, unauthorized);
      await answerRefresh({ ...RENEWED, accessToken: 'token-otra-vez' });
      const retry = controller().expectOne(`${API}/b`);
      expect(retry.request.headers.get('Authorization')).toBe('Bearer token-otra-vez');
      retry.flush({});
      await second;
      expect(navigate).not.toHaveBeenCalled();
    });

    it('tres 401 a la vez: una sola renovación y tres repeticiones', async () => {
      const urls = [`${API}/a`, `${API}/b`, `${API}/c`];
      const results = urls.map((url) => firstValueFrom(http().get(url)));
      for (const url of urls) controller().expectOne(url).flush(PROBLEM_401, unauthorized);
      await answerRefresh(RENEWED);

      for (const url of urls) {
        const retry = controller().expectOne(url);
        expect(retry.request.headers.get('Authorization')).toBe('Bearer token-renovado');
        retry.flush({ url });
      }
      await expect(Promise.all(results)).resolves.toEqual(urls.map((url) => ({ url })));
    });

    it('renovación no disponible (500): no termina la sesión, no navega y entrega el error de la renovación', async () => {
      const result = firstValueFrom(http().get(`${API}/grupos/5`)).catch((e: unknown) => e);
      controller().expectOne(`${API}/grupos/5`).flush(PROBLEM_401, unauthorized);
      await answerRefresh(PROBLEM_500, { status: 500, statusText: 'Error' });

      const error = (await result) as ApiError;
      expect(error.status).toBe(500);
      expect(error.traceId).toBe(PROBLEM_500.traceId);
      expect(session().isActive()).toBe(true);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('renovación no disponible (sin respuesta): el error tiene status 0', async () => {
      const result = firstValueFrom(http().get(`${API}/grupos/5`)).catch((e: unknown) => e);
      controller().expectOne(`${API}/grupos/5`).flush(PROBLEM_401, unauthorized);
      await tick();
      controller().expectOne(`${API}/auth/refresh`).error(new ProgressEvent('error'));

      expect(((await result) as ApiError).status).toBe(0);
      expect(session().isActive()).toBe(true);
    });
  });

  describe('401 (RFF-03)', () => {
    it('con token y la sesión sin renovar: termina la sesión y abre V-02 con volver y el aviso', async () => {
      const result = firstValueFrom(http().get(`${API}/grupos/5`)).catch((e: unknown) => e);
      controller().expectOne(`${API}/grupos/5`).flush(PROBLEM_401, unauthorized);
      await answerRefresh(PROBLEM_401_RF60, unauthorized);
      const error = (await result) as ApiError;

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

    it('varios 401 a la vez, con la renovación rechazada: una renovación y una sola navegación', async () => {
      const a = firstValueFrom(http().get(`${API}/a`)).catch((e: unknown) => e);
      const b = firstValueFrom(http().get(`${API}/b`)).catch((e: unknown) => e);
      controller().expectOne(`${API}/a`).flush(PROBLEM_401, unauthorized);
      controller().expectOne(`${API}/b`).flush(PROBLEM_401, unauthorized);
      await answerRefresh(PROBLEM_401_RF60, unauthorized);
      await Promise.all([a, b]);
      expect(navigate).toHaveBeenCalledTimes(1);
    });

    it('el 401 de la propia renovación no se trata como una petición con sesión', async () => {
      const result = session().refresh();
      const refresh = controller().expectOne(`${API}/auth/refresh`);
      expect(refresh.request.headers.has('Authorization')).toBe(false);
      refresh.flush(PROBLEM_401_RF60, unauthorized);

      await expect(result).resolves.toBe('ended');
      expect(session().isActive()).toBe(true); // la decisión la toma quien pidió la renovación
      expect(navigate).not.toHaveBeenCalled();
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
