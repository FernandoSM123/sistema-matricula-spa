import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from './api-url';
import { PerfilResponse } from './models';

/** `/me`: lo de quien inició sesión. El cliente nunca envía el id del usuario (RN-18, §3.3). */
@Injectable({ providedIn: 'root' })
export class MeApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/me`;

  /**
   * `GET /me`, como acción: la usa `SessionService` para el nombre del menú de la cuenta, fuera de
   * una vista. La consulta para `V-06` (un `httpResource`) la agrega `acceso`.
   */
  getProfile() {
    return this.http.get<PerfilResponse>(this.url);
  }
}
