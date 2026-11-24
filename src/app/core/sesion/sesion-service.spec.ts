import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AHORA, PERFIL_ESTUDIANTE, TOKEN_CAMBIO_PENDIENTE, TOKEN_ESTUDIANTE } from '../../../testing/sesion';
import { API_URL } from '../../api/api-url';
import { RELOJ } from './reloj';
import { CLAVE_SESION, SesionService } from './sesion-service';

const API = 'http://api.prueba/api/v1';

describe('SesionService (§4.1)', () => {
  let ahora: number;
  let navegar: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sessionStorage.clear();
    ahora = AHORA;
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_URL, useValue: API },
        { provide: RELOJ, useValue: () => ahora },
      ],
    });
    navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  const crear = () => TestBed.inject(SesionService);
  const http = () => TestBed.inject(HttpTestingController);
  const guardada = () => JSON.parse(sessionStorage.getItem(CLAVE_SESION) ?? 'null');
  const guardar = (valor: unknown) => sessionStorage.setItem(CLAVE_SESION, JSON.stringify(valor));
  const sesionGuardada = { ...TOKEN_ESTUDIANTE, nombre: 'María Fernanda Quesada Rojas' };

  describe('al arrancar', () => {
    it('sin clave, no hay sesión', () => {
      const sesion = crear();
      expect(sesion.activa()).toBe(false);
      expect(sesion.rol()).toBeNull();
      expect(sesion.token()).toBeNull();
    });

    it('lee la sesión guardada en sessionStorage', () => {
      guardar(sesionGuardada);
      const sesion = crear();
      expect(sesion.activa()).toBe(true);
      expect(sesion.rol()).toBe('Estudiante');
      expect(sesion.nombre()).toBe('María Fernanda Quesada Rojas');
      expect(sesion.token()).toBe('token-estudiante');
      expect(sesion.cambioPendiente()).toBe(false);
    });

    it('descarta una sesión vencida y borra la clave', () => {
      guardar(sesionGuardada);
      ahora = Date.parse(TOKEN_ESTUDIANTE.expiraEn);
      const sesion = crear();
      expect(sesion.activa()).toBe(false);
      expect(sesion.rol()).toBeNull();
      expect(sessionStorage.getItem(CLAVE_SESION)).toBeNull();
    });

    it.each([
      ['un JSON inválido', '{no es json'],
      ['un valor que no es un objeto', '"texto"'],
      ['un rol desconocido', JSON.stringify({ ...sesionGuardada, rol: 'Root' })],
      ['sin token', JSON.stringify({ ...sesionGuardada, accessToken: '' })],
      ['una fecha de vencimiento inválida', JSON.stringify({ ...sesionGuardada, expiraEn: 'mañana' })],
    ])('descarta %s', (_caso, valor) => {
      sessionStorage.setItem(CLAVE_SESION, valor);
      expect(crear().activa()).toBe(false);
      expect(sessionStorage.getItem(CLAVE_SESION)).toBeNull();
    });
  });

  describe('iniciar()', () => {
    it('guarda la sesión y pide el nombre a GET /me', async () => {
      const sesion = crear();
      const inicio = sesion.iniciar(TOKEN_ESTUDIANTE);

      expect(sesion.activa()).toBe(true);
      expect(sesion.rol()).toBe('Estudiante');
      http()
        .expectOne({ method: 'GET', url: `${API}/me` })
        .flush(PERFIL_ESTUDIANTE);
      await inicio;

      expect(sesion.nombre()).toBe('María Fernanda Quesada Rojas');
      TestBed.tick();
      expect(guardada()).toEqual(sesionGuardada);
    });

    it('con un cambio pendiente no pide GET /me, que respondería 403 RN-24', async () => {
      const sesion = crear();
      await sesion.iniciar(TOKEN_CAMBIO_PENDIENTE);

      http().expectNone(`${API}/me`);
      expect(sesion.cambioPendiente()).toBe(true);
      expect(sesion.nombre()).toBeNull();
    });

    it('si GET /me falla, la sesión sigue sin nombre (supuesto 2)', async () => {
      const sesion = crear();
      const inicio = sesion.iniciar(TOKEN_ESTUDIANTE);
      http().expectOne(`${API}/me`).flush(null, { status: 500, statusText: 'Error' });
      await inicio;

      expect(sesion.activa()).toBe(true);
      expect(sesion.nombre()).toBeNull();
    });

    it('reemplaza el token, como tras el cambio obligatorio (RFF-02)', async () => {
      const sesion = crear();
      await sesion.iniciar(TOKEN_CAMBIO_PENDIENTE);
      const inicio = sesion.iniciar({ ...TOKEN_ESTUDIANTE, accessToken: 'token-nuevo' });
      http().expectOne(`${API}/me`).flush(PERFIL_ESTUDIANTE);
      await inicio;

      expect(sesion.token()).toBe('token-nuevo');
      expect(sesion.cambioPendiente()).toBe(false);
      TestBed.tick();
      expect(guardada().accessToken).toBe('token-nuevo');
    });

    it('no pone el nombre si la sesión cambió mientras respondía GET /me', async () => {
      const sesion = crear();
      const inicio = sesion.iniciar(TOKEN_ESTUDIANTE);
      sesion.terminar();
      http().expectOne(`${API}/me`).flush(PERFIL_ESTUDIANTE);
      await inicio;

      expect(sesion.activa()).toBe(false);
      expect(sesion.nombre()).toBeNull();
    });

    it('deja de marcar la sesión como terminada', async () => {
      const sesion = crear();
      sesion.terminar();
      await sesion.iniciar(TOKEN_CAMBIO_PENDIENTE);
      expect(sesion.terminada()).toBe(false);
    });
  });

  describe('vencimiento (§4.3)', () => {
    it('lee expiraEn como lo envía la API: 7 decimales y desfase +00:00 (nucleo T7)', () => {
      guardar({ ...sesionGuardada, expiraEn: '2026-03-05T19:00:00.1536542+00:00' });
      const sesion = crear();
      expect(sesion.activa()).toBe(true);
      ahora = Date.parse('2026-03-05T19:00:00.154Z');
      expect(sesion.vencida()).toBe(true);
    });

    it('activa() es falso cuando pasa expiraEn, y vencida() lo distingue de no tener sesión', () => {
      guardar(sesionGuardada);
      const sesion = crear();
      expect(sesion.vencida()).toBe(false);

      ahora = Date.parse(TOKEN_ESTUDIANTE.expiraEn) + 1;
      expect(sesion.activa()).toBe(false);
      expect(sesion.vencida()).toBe(true);
    });
  });

  describe('terminar()', () => {
    it('descarta la sesión, borra la clave y queda marcada como terminada (RFF-03)', () => {
      guardar(sesionGuardada);
      const sesion = crear();
      sesion.terminar();

      expect(sesion.activa()).toBe(false);
      expect(sesion.rol()).toBeNull();
      expect(sesion.terminada()).toBe(true);
      TestBed.tick();
      expect(sessionStorage.getItem(CLAVE_SESION)).toBeNull();
    });
  });

  describe('cerrarSesion() (RFF-04)', () => {
    it('envía POST /auth/logout, descarta la sesión y abre la oferta con el aviso', async () => {
      guardar(sesionGuardada);
      const sesion = crear();
      const cierre = sesion.cerrarSesion();

      const peticion = http().expectOne({ method: 'POST', url: `${API}/auth/logout` });
      expect(sesion.activa()).toBe(false);
      peticion.flush(null, { status: 204, statusText: 'No Content' });
      await cierre;

      expect(sesion.terminada()).toBe(true);
      expect(navegar).toHaveBeenCalledWith('/oferta?aviso=sesion-cerrada');
      TestBed.tick();
      expect(sessionStorage.getItem(CLAVE_SESION)).toBeNull();
    });

    it('si la API responde 401 (sesión ya vencida), igual cierra y navega', async () => {
      guardar(sesionGuardada);
      const sesion = crear();
      const cierre = sesion.cerrarSesion();
      http().expectOne(`${API}/auth/logout`).flush(null, { status: 401, statusText: 'Unauthorized' });
      await cierre;

      expect(sesion.activa()).toBe(false);
      expect(navegar).toHaveBeenCalledWith('/oferta?aviso=sesion-cerrada');
    });

    it('si no hay respuesta, igual cierra y navega', async () => {
      guardar(sesionGuardada);
      const sesion = crear();
      const cierre = sesion.cerrarSesion();
      http().expectOne(`${API}/auth/logout`).error(new ProgressEvent('error'));
      await cierre;

      expect(sesion.activa()).toBe(false);
      expect(navegar).toHaveBeenCalledWith('/oferta?aviso=sesion-cerrada');
    });
  });
});
