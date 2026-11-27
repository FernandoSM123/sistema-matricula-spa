import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from './api-url';
import { NO_SESSION } from './http-context';
import { RefreshTokenRequest, TokenResponse } from './models';

/** `/auth`. `nucleo` y `sesiones` usan el cierre y la renovación; `acceso` agrega el resto (supuesto 1 de SPEC-nucleo). */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/auth`;

  /** `POST /auth/logout` (RF-08): invalida todos los tokens de la cuenta. Responde `204`. */
  logout() {
    return this.http.post<void>(`${this.url}/logout`, null);
  }

  /**
   * `POST /auth/refresh` (RF-60): cambia el refresh token por un par nuevo (RN-51). Es anónima, así
   * que va sin el token de acceso (`NO_SESSION`). Cualquier rechazo es un `401 RF-60`.
   */
  refresh(refreshToken: string) {
    return this.http.post<TokenResponse>(`${this.url}/refresh`, { refreshToken } satisfies RefreshTokenRequest, {
      context: new HttpContext().set(NO_SESSION, true),
    });
  }
}
