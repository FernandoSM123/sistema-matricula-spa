import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PROBLEMA_401, PROBLEMA_403_RN24, PROBLEMA_409_RN39, PROBLEMA_500 } from '../../../testing/problem-details';
import { AHORA, TOKEN_ESTUDIANTE } from '../../../testing/sesion';
import { API_URL } from '../../api/api-url';
import { ApiError } from '../../api/api-error';
import { RELOJ } from '../sesion/reloj';
import { CLAVE_SESION, SesionService } from '../sesion/sesion-service';
import { erroresInterceptor, TIEMPO_ESPERA } from './errores-interceptor';
import { tokenInterceptor } from './token-interceptor';

const API = 'http://api.prueba/api/v1';

describe('erroresInterceptor (§3.5, §4.2)', () => {
  let navegar: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ ...TOKEN_ESTUDIANTE, nombre: null }));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor, erroresInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_URL, useValue: API },
        { provide: RELOJ, useValue: () => AHORA },
      ],
    });
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'url', 'get').mockReturnValue('/grupos/5?pestana=horario');
    navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  const http = () => TestBed.inject(HttpClient);
  const control = () => TestBed.inject(HttpTestingController);
  const sesion = () => TestBed.inject(SesionService);

  /** Hace la petición, responde con el error y devuelve lo que recibe quien la hizo. */
  async function fallar(status: number, cuerpo: object, url = `${API}/grupos/5`): Promise<unknown> {
    const resultado = firstValueFrom(http().get(url)).catch((e: unknown) => e);
    control().expectOne(url).flush(cuerpo, { status, statusText: 'Error' });
    return resultado;
  }

  it('fija el tiempo de espera de 30 s en las peticiones a la API (§3.1)', () => {
    void firstValueFrom(http().get(`${API}/cursos`)).catch(() => undefined);
    const peticion = control().expectOne(`${API}/cursos`);
    expect(peticion.request.timeout).toBe(TIEMPO_ESPERA);
    expect(TIEMPO_ESPERA).toBe(30_000);
    peticion.flush([]);
  });

  it('respeta un tiempo de espera propio y no toca las peticiones a otros orígenes', () => {
    void firstValueFrom(http().get(`${API}/cursos`, { timeout: 5000 })).catch(() => undefined);
    void firstValueFrom(http().get('/iconos/buscar.svg')).catch(() => undefined);
    const api = control().expectOne(`${API}/cursos`);
    const icono = control().expectOne('/iconos/buscar.svg');
    expect(api.request.timeout).toBe(5000);
    expect(icono.request.timeout).toBeFalsy();
    api.flush([]);
    icono.flush('');
  });

  it('convierte el error en un ApiError', async () => {
    const error = (await fallar(409, PROBLEMA_409_RN39)) as ApiError;
    expect(error.name).toBe('ApiError');
    expect(error.status).toBe(409);
    expect(error.code).toBe('RN-39');
    expect(error.data).toEqual({ usuarioId: 12 });
    expect(navegar).not.toHaveBeenCalled();
  });

  it('sin respuesta da status 0', async () => {
    const resultado = firstValueFrom(http().get(`${API}/cursos`)).catch((e: unknown) => e);
    control().expectOne(`${API}/cursos`).error(new ProgressEvent('error'));
    expect(((await resultado) as ApiError).status).toBe(0);
  });

  it('deja los errores de otros orígenes como HttpErrorResponse', async () => {
    const resultado = firstValueFrom(http().get('/iconos/x.svg')).catch((e: unknown) => e);
    control().expectOne('/iconos/x.svg').flush('', { status: 404, statusText: 'Not Found' });
    expect(await resultado).toBeInstanceOf(HttpErrorResponse);
  });

  describe('401 (RFF-03)', () => {
    it('con token: termina la sesión y abre V-02 con volver y el aviso', async () => {
      const error = (await fallar(401, PROBLEMA_401)) as ApiError;

      expect(error.status).toBe(401);
      expect(sesion().activa()).toBe(false);
      expect(sesion().terminada()).toBe(true);
      expect(navegar).toHaveBeenCalledExactlyOnceWith(['/iniciar-sesion'], {
        queryParams: { volver: '/grupos/5?pestana=horario', aviso: 'sesion-terminada' },
      });
    });

    it('sin token (credenciales inválidas en el login) no navega', async () => {
      sesion().terminar();
      const error = (await fallar(401, PROBLEMA_401, `${API}/auth/login`)) as ApiError;
      expect(error.status).toBe(401);
      expect(navegar).not.toHaveBeenCalled();
    });

    it('varios 401 a la vez navegan una sola vez', async () => {
      const a = firstValueFrom(http().get(`${API}/a`)).catch((e: unknown) => e);
      const b = firstValueFrom(http().get(`${API}/b`)).catch((e: unknown) => e);
      control().expectOne(`${API}/a`).flush(PROBLEMA_401, { status: 401, statusText: 'Unauthorized' });
      control().expectOne(`${API}/b`).flush(PROBLEMA_401, { status: 401, statusText: 'Unauthorized' });
      await Promise.all([a, b]);
      expect(navegar).toHaveBeenCalledTimes(1);
    });

    it('el 401 del logout después de cerrarSesion() no abre V-02 (RFF-04)', async () => {
      const navegarUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      const cierre = sesion().cerrarSesion();
      const logout = control().expectOne(`${API}/auth/logout`);
      expect(logout.request.headers.get('Authorization')).toBe('Bearer token-estudiante');
      logout.flush(PROBLEMA_401, { status: 401, statusText: 'Unauthorized' });
      await cierre;

      expect(navegar).not.toHaveBeenCalled();
      expect(navegarUrl).toHaveBeenCalledWith('/oferta?aviso=sesion-cerrada');
    });
  });

  it('403 RN-24: abre V-03 (RFF-02)', async () => {
    const error = (await fallar(403, PROBLEMA_403_RN24)) as ApiError;
    expect(error.code).toBe('RN-24');
    expect(navegar).toHaveBeenCalledExactlyOnceWith(['/cambio-obligatorio']);
  });

  it.each([
    ['403 sin code', 403, { status: 403 }],
    ['403 RN-18', 403, { status: 403, code: 'RN-18', detail: 'No tiene acceso.' }],
    ['404', 404, { status: 404, detail: 'El grupo no existe.' }],
    ['500', 500, PROBLEMA_500],
  ])('%s: no navega, la vista lo presenta', async (_caso, status, cuerpo) => {
    const error = (await fallar(status, cuerpo)) as ApiError;
    expect(error.status).toBe(status);
    expect(navegar).not.toHaveBeenCalled();
    expect(sesion().activa()).toBe(true);
  });
});
