import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NOW, ESTUDIANTE_PROFILE, PASSWORD_CHANGE_TOKEN, ESTUDIANTE_TOKEN } from '../../../testing/session';
import { API_URL } from '../../api/api-url';
import { CLOCK } from './clock';
import { SESSION_KEY, SessionService } from './session-service';

const API = 'http://api.prueba/api/v1';

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

    it('descarta una sesión vencida y borra la clave', () => {
      store(storedSession);
      now = Date.parse(ESTUDIANTE_TOKEN.expiraEn);
      const session = create();
      expect(session.isActive()).toBe(false);
      expect(session.rol()).toBeNull();
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

  describe('vencimiento (§4.3)', () => {
    it('lee expiraEn como lo envía la API: 7 decimales y desfase +00:00 (nucleo T7)', () => {
      store({ ...storedSession, expiraEn: '2026-03-05T19:00:00.1536542+00:00' });
      const session = create();
      expect(session.isActive()).toBe(true);
      now = Date.parse('2026-03-05T19:00:00.154Z');
      expect(session.isExpired()).toBe(true);
    });

    it('isActive() es falso cuando pasa expiraEn, e isExpired() lo distingue de no tener sesión', () => {
      store(storedSession);
      const session = create();
      expect(session.isExpired()).toBe(false);

      now = Date.parse(ESTUDIANTE_TOKEN.expiraEn) + 1;
      expect(session.isActive()).toBe(false);
      expect(session.isExpired()).toBe(true);
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
