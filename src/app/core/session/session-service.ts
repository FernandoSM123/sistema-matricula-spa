import { computed, DestroyRef, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiError, isApiError, toApiError } from '../../api/api-error';
import { AuthApi } from '../../api/auth-api';
import { MeApi } from '../../api/me-api';
import { Rol, TokenResponse } from '../../api/models';
import { CLOCK } from './clock';

/** Única clave de `sessionStorage` de la aplicación (§4.1). */
export const SESSION_KEY = 'matricula.session';

const ROLES: readonly Rol[] = ['Administrador', 'Profesor', 'Estudiante'];

/** Margen antes de `expiraEn` para renovar: la latencia y una diferencia pequeña de reloj. */
const ACCESS_MARGIN = 30_000;

/**
 * Resultado de `refresh()` (RF-60):
 * - `renewed`: hay un token de acceso vigente (el nuevo, o el de una sesión que lo reemplazó).
 * - `ended`: la sesión ya no se puede renovar (`401`, sin refresh token o terminada): RFF-03.
 * - un `ApiError` (no disponible): sin respuesta, `429` o `5xx`. La sesión sigue y se puede intentar
 *   de nuevo; la petición que esperaba la renovación falla con este error (§3.5).
 */
export type RefreshResult = 'renewed' | 'ended' | ApiError;

/** Lo que se guarda de la sesión: la respuesta con token y el nombre de `GET /me`. */
interface Session extends TokenResponse {
  nombre: string | null;
}

/**
 * La sesión: el único estado compartido y el único que usa `sessionStorage` (§2.7, §4.1).
 * Los componentes la leen con sus signals, nunca del almacenamiento.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly authApi = inject(AuthApi);
  private readonly meApi = inject(MeApi);
  private readonly router = inject(Router);
  private readonly clock = inject(CLOCK);

  /**
   * Decisión 3 de SPEC-sesiones: la pestaña está abierta. Se guarda junto a la sesión, pasa a
   * `false` en `pagehide` y vuelve a `true` en `pageshow` desde el historial. Si al arrancar ya
   * estaba en `true`, el almacenamiento es la copia de una pestaña abierta (duplicada).
   */
  private tabOpen = true;
  private readonly session = signal<Session | null>(this.read());
  private readonly wasEnded = signal(false);
  /** Cambia con `start()` y `end()`, no con una renovación: distingue la sesión de una respuesta tardía. */
  private generation = 0;
  private refreshing: Promise<RefreshResult> | null = null;

  readonly token = computed(() => this.session()?.accessToken ?? null);
  readonly rol = computed(() => this.session()?.rol ?? null);
  readonly nombre = computed(() => this.session()?.nombre ?? null);
  /** Cambio de contraseña pendiente (RN-24): solo `V-03` y cerrar sesión (RFF-02). */
  readonly passwordChangePending = computed(() => this.session()?.debeCambiarContrasena ?? false);
  /** La sesión terminó durante el uso (401, cierre): RUI-09 deja salir sin preguntar. */
  readonly ended = this.wasEnded.asReadonly();

  constructor() {
    // §8.1: el único effect de la aplicación, para sincronizar la sesión con sessionStorage.
    effect(() => write(this.session(), this.tabOpen));
    this.watchTab();
  }

  /**
   * Hay sesión y no terminó (§4.3): no pasó `refreshExpiraEn`, o `expiraEn` sin refresh token.
   * El token de acceso puede estar vencido: la siguiente petición lo renueva (RF-60). Lee el reloj,
   * así que es un método.
   */
  isActive(): boolean {
    const session = this.session();
    return session !== null && !this.hasEnded(session);
  }

  /** Hay sesión, pero ya terminó: `authGuard` lo trata como RFF-03. */
  isExpired(): boolean {
    const session = this.session();
    return session !== null && this.hasEnded(session);
  }

  /** El token de acceso venció o vence en menos de `ACCESS_MARGIN`: conviene renovar antes de enviar. */
  accessExpired(): boolean {
    const session = this.session();
    return session !== null && Date.parse(session.expiraEn) - ACCESS_MARGIN <= this.clock();
  }

  /** La sesión no terminó y tiene refresh token: sin él (temporal, RN-52) no hay nada que renovar. */
  canRefresh(): boolean {
    const session = this.session();
    return session?.refreshToken != null && !this.hasEnded(session);
  }

  /**
   * RF-60: cambia el refresh token por un par nuevo. Una sola renovación a la vez por pestaña: las
   * llamadas que llegan mientras tanto reciben la misma promesa, porque reusar un refresh token
   * terminaría la sesión (RN-51). No descarta la sesión ni navega: lo deciden quienes la llaman.
   */
  refresh(): Promise<RefreshResult> {
    this.refreshing ??= this.renew().finally(() => (this.refreshing = null));
    return this.refreshing;
  }

  /**
   * Guarda la sesión de una respuesta con token (login, cambio obligatorio o cambiar contraseña)
   * y, sin un cambio pendiente, pide el nombre a `GET /me`, que con el cambio pendiente responde
   * `403 RN-24`. Si `GET /me` falla, la sesión sigue sin nombre (supuesto 2 de SPEC-nucleo).
   */
  async start(response: TokenResponse): Promise<void> {
    const session: Session = {
      accessToken: response.accessToken,
      expiraEn: response.expiraEn,
      rol: response.rol,
      debeCambiarContrasena: response.debeCambiarContrasena,
      refreshToken: response.refreshToken,
      refreshExpiraEn: response.refreshExpiraEn,
      nombre: null,
    };
    this.session.set(session);
    this.wasEnded.set(false);
    const generation = ++this.generation;
    if (session.debeCambiarContrasena) return;

    try {
      const profile = await firstValueFrom(this.meApi.getProfile());
      const datos = profile.datosPersonales;
      // Solo si sigue siendo la misma sesión: pudo terminar o reemplazarse mientras tanto. Una
      // renovación no la cambia: conserva el token renovado.
      const current = this.session();
      if (datos && current !== null && this.generation === generation) {
        this.session.set({ ...current, nombre: `${datos.nombre} ${datos.apellidos}` });
      }
    } catch {
      // Sin nombre: el menú de la cuenta muestra solo el rol.
    }
  }

  /** Descarta la sesión: `401` con sesión (RFF-03), vencimiento o cierre. */
  end(): void {
    this.session.set(null);
    this.wasEnded.set(true);
    this.generation++;
  }

  /**
   * RFF-04: envía `POST /auth/logout` (renovando antes si el token venció), descarta la sesión
   * aunque la llamada falle y abre la oferta con el aviso de sesión cerrada (supuesto 3 de
   * SPEC-nucleo).
   */
  async logout(): Promise<void> {
    // Decisión 4 de SPEC-sesiones: con el token vencido, renueva primero, así el cierre llega a la
    // API y termina también las sesiones de los demás dispositivos. Si no se puede renovar, el
    // logout fallaría igual: solo se descarta la sesión local.
    const renewed = !this.accessExpired() || !this.canRefresh() || (await this.refresh()) === 'renewed';

    // La petición sale al suscribirse, con el token todavía en la sesión. Se descarta antes de
    // la respuesta, así un 401 (sesión ya vencida) no dispara además la navegación de RFF-03.
    const request = renewed ? firstValueFrom(this.authApi.logout()) : null;
    this.end();
    try {
      await request;
    } catch {
      // Igual se cierra la sesión local (RFF-04).
    }
    await this.router.navigateByUrl('/oferta?aviso=sesion-cerrada');
  }

  private async renew(): Promise<RefreshResult> {
    const session = this.session();
    if (session?.refreshToken == null || this.hasEnded(session)) return 'ended';
    const generation = this.generation;

    let response: TokenResponse;
    try {
      response = await firstValueFrom(this.authApi.refresh(session.refreshToken));
    } catch (error) {
      // Llega como ApiError, ya convertido por errorInterceptor; toApiError() sobre un ApiError
      // daría status 0. Sin respuesta, 429 o 5xx no terminan la sesión (supuesto 1 de la spec).
      const apiError = isApiError(error) ? error : toApiError(error);
      return apiError.status === 401 ? 'ended' : apiError;
    }

    // La sesión pudo terminar (cierre, 401) o reemplazarse (cambio de contraseña) mientras tanto:
    // la respuesta se descarta y vale lo que haya ahora.
    const current = this.session();
    if (current === null) return 'ended';
    if (this.generation !== generation) return 'renewed';
    this.session.set({
      ...current,
      accessToken: response.accessToken,
      expiraEn: response.expiraEn,
      refreshToken: response.refreshToken,
      refreshExpiraEn: response.refreshExpiraEn,
    });
    return 'renewed';
  }

  /** El fin de la sesión: `refreshExpiraEn`, o `expiraEn` si no hay refresh token (temporal, RN-52). */
  private hasEnded(session: Session): boolean {
    return Date.parse(session.refreshExpiraEn ?? session.expiraEn) <= this.clock();
  }

  /**
   * Lee la sesión guardada; descarta la terminada, la que no tiene la forma esperada y la copiada de
   * una pestaña abierta, sin aviso: esa pestaña empieza como una nueva (decisión 3 de SPEC-sesiones).
   * La conservada queda marcada en el acto como de una pestaña abierta.
   */
  private read(): Session | null {
    const text = readStorage();
    const session = toSession(text);
    if (session === null || this.hasEnded(session) || wasTabOpen(text)) {
      write(null, false);
      return null;
    }
    write(session, true);
    return session;
  }

  /** `pagehide` (cierre, recarga, salida) y `pageshow` (vuelta desde el historial) cambian la marca. */
  private watchTab(): void {
    const view = inject(DOCUMENT).defaultView;
    if (view === null) return;

    const mark = (open: boolean) => {
      this.tabOpen = open;
      const session = this.session();
      if (session !== null) write(session, open);
    };
    const onHide = () => mark(false);
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) mark(true);
    };
    view.addEventListener('pagehide', onHide);
    view.addEventListener('pageshow', onShow);
    inject(DestroyRef).onDestroy(() => {
      view.removeEventListener('pagehide', onHide);
      view.removeEventListener('pageshow', onShow);
    });
  }
}

function toSession(text: string | null): Session | null {
  if (text === null) return null;
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof value !== 'object' || value === null) return null;

  const v = value as Record<string, unknown>;
  const { accessToken, expiraEn, rol, debeCambiarContrasena, nombre } = v;
  if (
    typeof accessToken !== 'string' ||
    accessToken === '' ||
    !isDate(expiraEn) ||
    !ROLES.includes(rol as Rol) ||
    typeof debeCambiarContrasena !== 'boolean' ||
    (nombre !== null && nombre !== undefined && typeof nombre !== 'string')
  ) {
    return null;
  }

  // Sin refresh token: temporal (RN-52) o una sesión guardada antes de la renovación. Con uno, su fin es obligatorio.
  const refresh = toRefresh(v['refreshToken'] ?? null, v['refreshExpiraEn'] ?? null);
  if (refresh === null) return null;

  return { accessToken, expiraEn, rol: rol as Rol, debeCambiarContrasena, ...refresh, nombre: nombre ?? null };
}

/** Los dos datos del refresh token: los dos con valor o los dos en `null`; si no, `null` (forma inválida). */
function toRefresh(
  refreshToken: unknown,
  refreshExpiraEn: unknown,
): Pick<Session, 'refreshToken' | 'refreshExpiraEn'> | null {
  if (refreshToken === null && refreshExpiraEn === null) return { refreshToken: null, refreshExpiraEn: null };
  if (typeof refreshToken === 'string' && refreshToken !== '' && isDate(refreshExpiraEn)) {
    return { refreshToken, refreshExpiraEn };
  }
  return null;
}

function isDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

/** La sesión guardada traía `tabOpen: true`: la escribió una pestaña que sigue abierta. */
function wasTabOpen(text: string | null): boolean {
  try {
    const value: unknown = JSON.parse(text ?? 'null');
    return typeof value === 'object' && value !== null && (value as Record<string, unknown>)['tabOpen'] === true;
  } catch {
    return false;
  }
}

function readStorage(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null; // Almacenamiento bloqueado por el navegador: se trabaja sin sesión guardada.
  }
}

function write(session: Session | null, tabOpen: boolean): void {
  try {
    if (session === null) sessionStorage.removeItem(SESSION_KEY);
    else sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, tabOpen }));
  } catch {
    // Almacenamiento lleno o bloqueado: la sesión sigue en memoria hasta recargar.
  }
}
