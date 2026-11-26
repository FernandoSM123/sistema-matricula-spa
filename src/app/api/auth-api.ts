import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from './api-url';

/** `/auth`. `nucleo` solo usa el cierre de sesión; `acceso` agrega el resto (supuesto 1 de SPEC-nucleo). */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/auth`;

  /** `POST /auth/logout` (RF-08): invalida todos los tokens de la cuenta. Responde `204`. */
  logout() {
    return this.http.post<void>(`${this.url}/logout`, null);
  }
}
