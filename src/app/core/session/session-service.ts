import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApi } from '../../api/auth-api';
import { MeApi } from '../../api/me-api';
import { Rol, TokenResponse } from '../../api/models';
import { CLOCK } from './clock';

/** Única clave de `sessionStorage` de la aplicación (§4.1). */
export const SESSION_KEY = 'matricula.session';

const ROLES: readonly Rol[] = ['Administrador', 'Profesor', 'Estudiante'];

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

  private readonly session = signal<Session | null>(this.read());
  private readonly wasEnded = signal(false);

  readonly token = computed(() => this.session()?.accessToken ?? null);
  readonly rol = computed(() => this.session()?.rol ?? null);
  readonly nombre = computed(() => this.session()?.nombre ?? null);
  /** Cambio de contraseña pendiente (RN-24): solo `V-03` y cerrar sesión (RFF-02). */
  readonly passwordChangePending = computed(() => this.session()?.debeCambiarContrasena ?? false);
  /** La sesión terminó durante el uso (401, cierre): RUI-09 deja salir sin preguntar. */
  readonly ended = this.wasEnded.asReadonly();

  constructor() {
    // §8.1: el único effect de la aplicación, para sincronizar la sesión con sessionStorage.
    effect(() => write(this.session()));
  }

  /** Hay sesión y no pasó `expiraEn` (§4.3). Lee el reloj, así que es un método. */
  isActive(): boolean {
    const session = this.session();
    return session !== null && !this.hasExpired(session);
  }

  /** Hay sesión, pero `expiraEn` ya pasó: `authGuard` lo trata como RFF-03. */
  isExpired(): boolean {
    const session = this.session();
    return session !== null && this.hasExpired(session);
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
      nombre: null,
    };
    this.session.set(session);
    this.wasEnded.set(false);
    if (session.debeCambiarContrasena) return;

    try {
      const profile = await firstValueFrom(this.meApi.getProfile());
      const datos = profile.datosPersonales;
      // Solo si sigue siendo la misma sesión: pudo terminar o reemplazarse mientras tanto.
      if (datos && this.session() === session) {
        this.session.set({ ...session, nombre: `${datos.nombre} ${datos.apellidos}` });
      }
    } catch {
      // Sin nombre: el menú de la cuenta muestra solo el rol.
    }
  }

  /** Descarta la sesión: `401` con sesión (RFF-03), vencimiento o cierre. */
  end(): void {
    this.session.set(null);
    this.wasEnded.set(true);
  }

  /**
   * RFF-04: envía `POST /auth/logout`, descarta la sesión aunque la llamada falle y abre la
   * oferta con el aviso de sesión cerrada (supuesto 3 de SPEC-nucleo).
   */
  async logout(): Promise<void> {
    // La petición sale al suscribirse, con el token todavía en la sesión. Se descarta antes de
    // la respuesta, así un 401 (sesión ya vencida) no dispara además la navegación de RFF-03.
    const request = firstValueFrom(this.authApi.logout());
    this.end();
    try {
      await request;
    } catch {
      // Igual se cierra la sesión local (RFF-04).
    }
    await this.router.navigateByUrl('/oferta?aviso=sesion-cerrada');
  }

  private hasExpired(session: Session): boolean {
    return Date.parse(session.expiraEn) <= this.clock();
  }

  /** Lee la sesión guardada; descarta la vencida o la que no tiene la forma esperada. */
  private read(): Session | null {
    const session = toSession(readStorage());
    if (session === null || this.hasExpired(session)) {
      write(null);
      return null;
    }
    return session;
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
    typeof expiraEn !== 'string' ||
    Number.isNaN(Date.parse(expiraEn)) ||
    !ROLES.includes(rol as Rol) ||
    typeof debeCambiarContrasena !== 'boolean' ||
    (nombre !== null && nombre !== undefined && typeof nombre !== 'string')
  ) {
    return null;
  }
  return { accessToken, expiraEn, rol: rol as Rol, debeCambiarContrasena, nombre: nombre ?? null };
}

function readStorage(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null; // Almacenamiento bloqueado por el navegador: se trabaja sin sesión guardada.
  }
}

function write(session: Session | null): void {
  try {
    if (session === null) sessionStorage.removeItem(SESSION_KEY);
    else sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Almacenamiento lleno o bloqueado: la sesión sigue en memoria hasta recargar.
  }
}
