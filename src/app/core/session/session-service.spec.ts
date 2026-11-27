import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NOW, ESTUDIANTE_PROFILE, PASSWORD_CHANGE_TOKEN, ESTUDIANTE_TOKEN } from '../../../testing/session';
import { API_URL } from '../../api/api-url';
import { TokenResponse } from '../../api/models';
import { errorInterceptor } from '../http/error-interceptor';
import { tokenInterceptor } from '../http/token-interceptor';
import { CLOCK } from './clock';
import { SESSION_KEY, SessionService } from './session-service';

const API = 'http://api.prueba/api/v1';
/** Vence el token de acceso de `ESTUDIANTE_TOKEN`. */
const ACCESS_END = Date.parse(ESTUDIANTE_TOKEN.expiraEn);
/** Termina la sesión de `ESTUDIANTE_TOKEN` (RN-50). */
const SESSION_END = Date.parse(ESTUDIANTE_TOKEN.refreshExpiraEn ?? '');

const problem = (status: number, code?: string) => ({ status, title: 'Error', detail: 'La sesión terminó.', code });

describe('SessionService (§4.1)', () => {
  let now: number;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sessionStorage.clear();
    now = NOW;
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_URL, useValue: API },
        { provide: CLOCK, useValue: () => now },
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  const create = () => TestBed.inject(SessionService);
  const http = () => TestBed.inject(HttpTestingController);
  const stored = () => JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null');
  const store = (value: unknown) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
  const storedSession = { ...ESTUDIANTE_TOKEN, nombre: 'María Fernanda Quesada Rojas' };

  describe('al arrancar', () => {
    it('sin clave, no hay sesión', () => {
      const session = create();
      expect(session.isActive()).toBe(false);
      expect(session.rol()).toBeNull();
      expect(session.token()).toBeNull();
    });

    it('lee la sesión guardada en sessionStorage', () => {
      store(storedSession);
      const session = create();
      expect(session.isActive()).toBe(true);
      expect(session.rol()).toBe('Estudiante');
      expect(session.nombre()).toBe('María Fernanda Quesada Rojas');
      expect(session.token()).toBe('token-estudiante');
      expect(session.passwordChangePending()).toBe(false);
    });

    it('descarta una sesión terminada (pasó refreshExpiraEn) y borra la clave', () => {
      store(storedSession);
      now = SESSION_END;
      const session = create();
      expect(session.isActive()).toBe(false);
      expect(session.rol()).toBeNull();
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it('conserva una sesión con el token de acceso vencido si la sesión sigue vigente (RN-50)', () => {
      store(storedSession);
      now = ACCESS_END;
      const session = create();
      expect(session.isActive()).toBe(true);
      expect(session.token()).toBe('token-estudiante');
    });

    it('sin refresh token (temporal), descarta la sesión cuando pasa expiraEn', () => {
      store({ ...PASSWORD_CHANGE_TOKEN, nombre: null });
      now = ACCESS_END;
      expect(create().isActive()).toBe(false);
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it.each([
      ['un JSON inválido', '{no es json'],
      ['un valor que no es un objeto', '"texto"'],
      ['un rol desconocido', JSON.stringify({ ...storedSession, rol: 'Root' })],
      ['sin token', JSON.stringify({ ...storedSession, accessToken: '' })],
      ['una fecha de vencimiento inválida', JSON.stringify({ ...storedSession, expiraEn: 'mañana' })],
      ['un refresh token sin su fin', JSON.stringify({ ...storedSession, refreshExpiraEn: null })],
      ['un fin sin refresh token', JSON.stringify({ ...storedSession, refreshToken: null })],
      ['un fin de sesión inválido', JSON.stringify({ ...storedSession, refreshExpiraEn: 'mañana' })],
    ])('descarta %s', (_case, value) => {
      sessionStorage.setItem(SESSION_KEY, value);
      expect(create().isActive()).toBe(false);
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it('lee una sesión sin refresh token: temporal (RN-52) o guardada antes de la renovación', () => {
      const previous: Record<string, unknown> = { ...storedSession };
      delete previous['refreshToken'];
      delete previous['refreshExpiraEn'];
      store(previous);
      expect(create().isActive()).toBe(true);
      TestBed.tick();
      expect(stored()).toEqual({ ...storedSession, refreshToken: null, refreshExpiraEn: null });
    });
  });

  describe('start()', () => {
    it('guarda la sesión y pide el nombre a GET /me', async () => {
      const session = create();
      const starting = session.start(ESTUDIANTE_TOKEN);

      expect(session.isActive()).toBe(true);
      expect(session.rol()).toBe('Estudiante');
      http()
        .expectOne({ method: 'GET', url: `${API}/me` })
        .flush(ESTUDIANTE_PROFILE);
      await starting;

      expect(session.nombre()).toBe('María Fernanda Quesada Rojas');
      TestBed.tick();
      expect(stored()).toEqual(storedSession);
    });

    it('con un cambio pendiente no pide GET /me, que respondería 403 RN-24', async () => {
      const session = create();
      await session.start(PASSWORD_CHANGE_TOKEN);

      http().expectNone(`${API}/me`);
      expect(session.passwordChangePending()).toBe(true);
      expect(session.nombre()).toBeNull();
    });

    it('si GET /me falla, la sesión sigue sin nombre (supuesto 2)', async () => {
      const session = create();
      const starting = session.start(ESTUDIANTE_TOKEN);
      http().expectOne(`${API}/me`).flush(null, { status: 500, statusText: 'Error' });
      await starting;

      expect(session.isActive()).toBe(true);
      expect(session.nombre()).toBeNull();
    });

    it('reemplaza el token, como tras el cambio obligatorio (RFF-02)', async () => {
      const session = create();
      await session.start(PASSWORD_CHANGE_TOKEN);
      const starting = session.start({ ...ESTUDIANTE_TOKEN, accessToken: 'token-nuevo' });
      http().expectOne(`${API}/me`).flush(ESTUDIANTE_PROFILE);
      await starting;

      expect(session.token()).toBe('token-nuevo');
      expect(session.passwordChangePending()).toBe(false);
      TestBed.tick();
      expect(stored().accessToken).toBe('token-nuevo');
    });

    it('no pone el nombre si la sesión cambió mientras respondía GET /me', async () => {
      const session = create();
      const starting = session.start(ESTUDIANTE_TOKEN);
      session.end();
      http().expectOne(`${API}/me`).flush(ESTUDIANTE_PROFILE);
      await starting;

      expect(session.isActive()).toBe(false);
      expect(session.nombre()).toBeNull();
    });

    it('deja de marcar la sesión como terminada', async () => {
      const session = create();
      session.end();
      await session.start(PASSWORD_CHANGE_TOKEN);
      expect(session.ended()).toBe(false);
    });
  });

  describe('fin de la sesión (§4.3, RN-50)', () => {
    it('lee las fechas como las envía la API: 7 decimales y desfase +00:00 (nucleo T7)', () => {
      store({ ...storedSession, refreshExpiraEn: '2026-03-06T02:00:00.1536542+00:00' });
      const session = create();
      now = SESSION_END + 152;
      expect(session.isActive()).toBe(true);
      now = Date.parse('2026-03-06T02:00:00.154Z');
      expect(session.isExpired()).toBe(true);
    });

    it('la sesión termina en refreshExpiraEn, no en expiraEn; isExpired() lo distingue de no tener sesión', () => {
      store(storedSession);
      const session = create();
      expect(session.isExpired()).toBe(false);

      now = ACCESS_END + 1;
      expect(session.isActive()).toBe(true);
      expect(session.isExpired()).toBe(false);

      now = SESSION_END;
      expect(session.isActive()).toBe(false);
      expect(session.isExpired()).toBe(true);
    });

    it('sin refresh token (temporal), termina en expiraEn', async () => {
      const session = create();
      await session.start(PASSWORD_CHANGE_TOKEN);
      now = ACCESS_END;
      expect(session.isExpired()).toBe(true);
    });
  });

  describe('accessExpired()', () => {
    it('es verdadero desde 30 segundos antes de expiraEn (margen para la latencia y el reloj)', () => {
      store(storedSession);
      const session = create();
      now = ACCESS_END - 30_001;
      expect(session.accessExpired()).toBe(false);
      now = ACCESS_END - 30_000;
      expect(session.accessExpired()).toBe(true);
    });

    it('sin sesión es falso', () => {
      expect(create().accessExpired()).toBe(false);
    });
  });

  describe('refresh() (RF-60)', () => {
    const RENEWED: TokenResponse = {
      ...ESTUDIANTE_TOKEN,
      accessToken: 'token-renovado',
      expiraEn: '2026-03-05T19:15:00Z',
      refreshToken: 'refresh-renovado',
    };

    const refreshRequest = () => http().expectOne({ method: 'POST', url: `${API}/auth/refresh` });

    beforeEach(() => store(storedSession));

    it('envía el refresh token, reemplaza el par y conserva el nombre', async () => {
      const session = create();
      const renewing = session.refresh();
      const request = refreshRequest();
      expect(request.request.body).toEqual({ refreshToken: 'refresh-estudiante' });
      request.flush(RENEWED);

      await expect(renewing).resolves.toBe('renewed');
      expect(session.token()).toBe('token-renovado');
      expect(session.nombre()).toBe('María Fernanda Quesada Rojas');
      TestBed.tick();
      expect(stored()).toEqual({ ...storedSession, ...RENEWED });
    });

    it('dos llamadas a la vez hacen una sola petición y reciben el mismo resultado', async () => {
      const session = create();
      const first = session.refresh();
      const second = session.refresh();
      refreshRequest().flush(RENEWED);

      await expect(Promise.all([first, second])).resolves.toEqual(['renewed', 'renewed']);
    });

    it('después de terminar, una llamada nueva hace otra petición con el refresh token nuevo', async () => {
      const session = create();
      const first = session.refresh();
      refreshRequest().flush(RENEWED);
      await first;

      const second = session.refresh();
      const request = refreshRequest();
      expect(request.request.body).toEqual({ refreshToken: 'refresh-renovado' });
      request.flush({ ...RENEWED, accessToken: 'token-otra-vez' });
      await expect(second).resolves.toBe('renewed');
    });

    it('el 401 de la API da ended, sin descartar la sesión ni navegar (lo deciden los interceptores)', async () => {
      const session = create();
      const renewing = session.refresh();
      refreshRequest().flush(problem(401, 'RF-60'), { status: 401, statusText: 'Unauthorized' });

      await expect(renewing).resolves.toBe('ended');
      expect(session.token()).toBe('token-estudiante');
      expect(navigate).not.toHaveBeenCalled();
    });

    it.each([
      ['un 429', 429],
      ['un 500', 500],
    ])('%s da unavailable y la sesión sigue', async (_case, status) => {
      const session = create();
      const renewing = session.refresh();
      refreshRequest().flush(problem(status), { status, statusText: 'Error' });
      await expect(renewing).resolves.toBe('unavailable');
      expect(session.isActive()).toBe(true);
    });

    it('sin respuesta da unavailable', async () => {
      const session = create();
      const renewing = session.refresh();
      refreshRequest().error(new ProgressEvent('error'));
      await expect(renewing).resolves.toBe('unavailable');
    });

    it('sin refresh token (temporal) da ended sin hacer la petición', async () => {
      sessionStorage.clear();
      const session = create();
      await session.start(PASSWORD_CHANGE_TOKEN);
      await expect(session.refresh()).resolves.toBe('ended');
      http().expectNone(`${API}/auth/refresh`);
    });

    it('con la sesión terminada, o sin sesión, da ended sin hacer la petición', async () => {
      const session = create();
      now = SESSION_END;
      await expect(session.refresh()).resolves.toBe('ended');
      session.end();
      await expect(session.refresh()).resolves.toBe('ended');
      http().expectNone(`${API}/auth/refresh`);
    });

    it('si la sesión terminó mientras tanto, descarta la respuesta', async () => {
      const session = create();
      const renewing = session.refresh();
      session.end();
      refreshRequest().flush(RENEWED);

      await expect(renewing).resolves.toBe('ended');
      expect(session.token()).toBeNull();
    });

    it('si la sesión se reemplazó mientras tanto (cambio de contraseña), conserva la nueva', async () => {
      const session = create();
      const renewing = session.refresh();
      const starting = session.start({ ...ESTUDIANTE_TOKEN, accessToken: 'token-del-cambio' });
      refreshRequest().flush(RENEWED);

      await expect(renewing).resolves.toBe('renewed');
      expect(session.token()).toBe('token-del-cambio');
      http().expectOne(`${API}/me`).flush(ESTUDIANTE_PROFILE);
      await starting;
    });

    it('si responde mientras GET /me pone el nombre, conserva el nombre', async () => {
      sessionStorage.clear();
      const session = create();
      const starting = session.start(ESTUDIANTE_TOKEN);
      const renewing = session.refresh();
      http().expectOne(`${API}/me`).flush(ESTUDIANTE_PROFILE);
      await starting;
      refreshRequest().flush(RENEWED);

      await expect(renewing).resolves.toBe('renewed');
      expect(session.token()).toBe('token-renovado');
      expect(session.nombre()).toBe('María Fernanda Quesada Rojas');
    });
  });

  describe('refresh() con los interceptores reales', () => {
    // El error llega a refresh() ya convertido en ApiError por errorInterceptor (riesgo del plan).
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([tokenInterceptor, errorInterceptor])),
          provideHttpClientTesting(),
          provideRouter([]),
          { provide: API_URL, useValue: API },
          { provide: CLOCK, useValue: () => now },
        ],
      });
      store(storedSession);
    });

    it('el 401 RF-60 da ended', async () => {
      const session = create();
      const renewing = session.refresh();
      http().expectOne(`${API}/auth/refresh`).flush(problem(401, 'RF-60'), { status: 401, statusText: 'Unauthorized' });

      await expect(renewing).resolves.toBe('ended');
    });

    it('el 500 da unavailable', async () => {
      const session = create();
      const renewing = session.refresh();
      http().expectOne(`${API}/auth/refresh`).flush(problem(500), { status: 500, statusText: 'Error' });
      await expect(renewing).resolves.toBe('unavailable');
    });
  });

  describe('end()', () => {
    it('descarta la sesión, borra la clave y queda marcada como terminada (RFF-03)', () => {
      store(storedSession);
      const session = create();
      session.end();

      expect(session.isActive()).toBe(false);
      expect(session.rol()).toBeNull();
      expect(session.ended()).toBe(true);
      TestBed.tick();
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    });
  });

  describe('logout() (RFF-04)', () => {
    it('envía POST /auth/logout, descarta la sesión y abre la oferta con el aviso', async () => {
      store(storedSession);
      const session = create();
      const closing = session.logout();

      const request = http().expectOne({ method: 'POST', url: `${API}/auth/logout` });
      expect(session.isActive()).toBe(false);
      request.flush(null, { status: 204, statusText: 'No Content' });
      await closing;

      expect(session.ended()).toBe(true);
      expect(navigate).toHaveBeenCalledWith('/oferta?aviso=sesion-cerrada');
      TestBed.tick();
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it('si la API responde 401 (sesión ya vencida), igual cierra y navega', async () => {
      store(storedSession);
      const session = create();
      const closing = session.logout();
      http().expectOne(`${API}/auth/logout`).flush(null, { status: 401, statusText: 'Unauthorized' });
      await closing;

      expect(session.isActive()).toBe(false);
      expect(navigate).toHaveBeenCalledWith('/oferta?aviso=sesion-cerrada');
    });

    it('si no hay respuesta, igual cierra y navega', async () => {
      store(storedSession);
      const session = create();
      const closing = session.logout();
      http().expectOne(`${API}/auth/logout`).error(new ProgressEvent('error'));
      await closing;

      expect(session.isActive()).toBe(false);
      expect(navigate).toHaveBeenCalledWith('/oferta?aviso=sesion-cerrada');
    });
  });
});
