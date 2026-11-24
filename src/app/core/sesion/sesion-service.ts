import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApi } from '../../api/auth-api';
import { MeApi } from '../../api/me-api';
import { Rol, TokenResponse } from '../../api/modelos';
import { RELOJ } from './reloj';

/** Única clave de `sessionStorage` de la aplicación (§4.1). */
export const CLAVE_SESION = 'matricula.sesion';

const ROLES: readonly Rol[] = ['Administrador', 'Profesor', 'Estudiante'];

/** Lo que se guarda de la sesión: la respuesta con token y el nombre de `GET /me`. */
interface Sesion extends TokenResponse {
  nombre: string | null;
}

/**
 * La sesión: el único estado compartido y el único que usa `sessionStorage` (§2.7, §4.1).
 * Los componentes la leen con sus signals, nunca del almacenamiento.
 */
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly authApi = inject(AuthApi);
  private readonly meApi = inject(MeApi);
  private readonly router = inject(Router);
  private readonly reloj = inject(RELOJ);

  private readonly sesion = signal<Sesion | null>(this.leer());
  private readonly fueTerminada = signal(false);

  readonly token = computed(() => this.sesion()?.accessToken ?? null);
  readonly rol = computed(() => this.sesion()?.rol ?? null);
  readonly nombre = computed(() => this.sesion()?.nombre ?? null);
  /** Cambio de contraseña pendiente (RN-24): solo `V-03` y cerrar sesión (RFF-02). */
  readonly cambioPendiente = computed(() => this.sesion()?.debeCambiarContrasena ?? false);
  /** La sesión terminó durante el uso (401, cierre): RUI-09 deja salir sin preguntar. */
  readonly terminada = this.fueTerminada.asReadonly();

  constructor() {
    // §8.1: el único effect de la aplicación, para sincronizar la sesión con sessionStorage.
    effect(() => escribir(this.sesion()));
  }

  /** Hay sesión y no pasó `expiraEn` (§4.3). Lee el reloj, así que es un método. */
  activa(): boolean {
    const sesion = this.sesion();
    return sesion !== null && !this.paso(sesion);
  }

  /** Hay sesión, pero `expiraEn` ya pasó: `sesionGuard` lo trata como RFF-03. */
  vencida(): boolean {
    const sesion = this.sesion();
    return sesion !== null && this.paso(sesion);
  }

  /**
   * Guarda la sesión de una respuesta con token (login, cambio obligatorio o cambiar contraseña)
   * y, sin un cambio pendiente, pide el nombre a `GET /me`, que con el cambio pendiente responde
   * `403 RN-24`. Si `GET /me` falla, la sesión sigue sin nombre (supuesto 2 de SPEC-nucleo).
   */
  async iniciar(respuesta: TokenResponse): Promise<void> {
    const sesion: Sesion = {
      accessToken: respuesta.accessToken,
      expiraEn: respuesta.expiraEn,
      rol: respuesta.rol,
      debeCambiarContrasena: respuesta.debeCambiarContrasena,
      nombre: null,
    };
    this.sesion.set(sesion);
    this.fueTerminada.set(false);
    if (sesion.debeCambiarContrasena) return;

    try {
      const perfil = await firstValueFrom(this.meApi.obtenerPerfil());
      const datos = perfil.datosPersonales;
      // Solo si sigue siendo la misma sesión: pudo terminar o reemplazarse mientras tanto.
      if (datos && this.sesion() === sesion) {
        this.sesion.set({ ...sesion, nombre: `${datos.nombre} ${datos.apellidos}` });
      }
    } catch {
      // Sin nombre: el menú de la cuenta muestra solo el rol.
    }
  }

  /** Descarta la sesión: `401` con sesión (RFF-03), vencimiento o cierre. */
  terminar(): void {
    this.sesion.set(null);
    this.fueTerminada.set(true);
  }

  /**
   * RFF-04: envía `POST /auth/logout`, descarta la sesión aunque la llamada falle y abre la
   * oferta con el aviso de sesión cerrada (supuesto 3 de SPEC-nucleo).
   */
  async cerrarSesion(): Promise<void> {
    // La petición sale al suscribirse, con el token todavía en la sesión. Se descarta antes de
    // la respuesta, así un 401 (sesión ya vencida) no dispara además la navegación de RFF-03.
    const logout = firstValueFrom(this.authApi.cerrarSesion());
    this.terminar();
    try {
      await logout;
    } catch {
      // Igual se cierra la sesión local (RFF-04).
    }
    await this.router.navigateByUrl('/oferta?aviso=sesion-cerrada');
  }

  private paso(sesion: Sesion): boolean {
    return Date.parse(sesion.expiraEn) <= this.reloj();
  }

  /** Lee la sesión guardada; descarta la vencida o la que no tiene la forma esperada. */
  private leer(): Sesion | null {
    const sesion = aSesion(leerAlmacenamiento());
    if (sesion === null || this.paso(sesion)) {
      escribir(null);
      return null;
    }
    return sesion;
  }
}

function aSesion(texto: string | null): Sesion | null {
  if (texto === null) return null;
  let valor: unknown;
  try {
    valor = JSON.parse(texto);
  } catch {
    return null;
  }
  if (typeof valor !== 'object' || valor === null) return null;
  const v = valor as Record<string, unknown>;
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

function leerAlmacenamiento(): string | null {
  try {
    return sessionStorage.getItem(CLAVE_SESION);
  } catch {
    return null; // Almacenamiento bloqueado por el navegador: se trabaja sin sesión guardada.
  }
}

function escribir(sesion: Sesion | null): void {
  try {
    if (sesion === null) sessionStorage.removeItem(CLAVE_SESION);
    else sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch {
    // Almacenamiento lleno o bloqueado: la sesión sigue en memoria hasta recargar.
  }
}
