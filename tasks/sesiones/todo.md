# Tareas: sesiones

Corrección `sesiones`, previa a `componentes` (ver el [mapa](../../specs/mapa-modulos.md)). Spec: [`specs/SPEC-sesiones.md`](../../specs/SPEC-sesiones.md) · Plan: [`plan.md`](plan.md)

**Estado de la lista:** Aprobada (2026-11-26)

Cada tarea termina con:
- `pnpm format:check`, `pnpm lint`, `pnpm test --watch=false` y `pnpm build` en verde;
- la verificación indicada;
- un solo commit en la rama `sesiones`, con el código y la actualización de este archivo, la spec y el mapa. En la tabla se marca ✅, sin el hash.

## Estado

| Tarea | Estado | Código | Pruebas unitarias | Verificación manual | Commit |
|---|---|:---:|:---:|:---:|:---:|
| T1. Contrato y `AuthApi.refresh()` | Pendiente | ⬜ | ⬜ | ⬜ | ⬜ |
| T2. `SessionService`: fin de la sesión y `refresh()` | Pendiente | ⬜ | ⬜ | ➖ | ⬜ |
| T3. Pestaña duplicada | Pendiente | ⬜ | ⬜ | ➖ | ⬜ |
| T4. Interceptores | Pendiente | ⬜ | ⬜ | ➖ | ⬜ |
| T5. Cierre de sesión y documentos | Pendiente | ⬜ | ⬜ | ➖ | ⬜ |
| T6. Verificación manual y cierre | Pendiente | ➖ | ⬜ | ⬜ | ⬜ |

**Estados de tarea:**
- **Pendiente:** no se ha empezado.
- **En progreso:** se está trabajando en ella.
- **Implementada:** el código está hecho, pero falta alguna columna o la revisión del usuario.
- **Bloqueada:** no puede avanzar; se indica el motivo debajo de la tabla.
- **Completada:** todas las columnas en ✅, ➖ o ⏳.

**Columnas:** ✅ hecho · ⬜ pendiente · ➖ no aplica · ⏳ parte diferida a otro módulo (anotada en sus tareas)

## Verificaciones heredadas

Ninguna del mapa va a esta corrección. T5 agrega la renovación a la verificación heredada de `acceso`.

## Detalle

### T1. Contrato y `AuthApi.refresh()`
- Acceptance:
  - `schema.d.ts` regenerado con `pnpm api:types`. El diff solo trae los 32 esquemas renombrados (§2.6 de la `SPEC-nombres` de la API), `refreshToken` y `refreshExpiraEn` anulables en `TokenResponse`, `RefreshTokenRequest` y `POST /api/v1/auth/refresh`.
  - `api/http-context.ts`: `NO_SESSION`, un `HttpContextToken<boolean>` (por defecto `false`), con su comentario.
  - `AuthApi.refresh(refreshToken)`: `POST /auth/refresh` con `{ refreshToken }` y `NO_SESSION`, que devuelve `TokenResponse`.
  - `src/testing/session.ts`: `ESTUDIANTE_TOKEN` con refresh token y `refreshExpiraEn` (8 horas desde `NOW`); `PASSWORD_CHANGE_TOKEN` con los dos en `null`. Las pruebas actuales siguen en verde.
- Verify:
  - `pnpm api:types` dos veces seguidas no deja diferencias en git.
  - Prueba de `AuthApi.refresh()` con `HttpTestingController`: método, URL, cuerpo y `NO_SESSION` en el contexto.
  - Prueba de tipos: `TokenResponse['refreshToken']` es `string | null`.
  - Se anota la carga inicial del build, como punto de partida del criterio 2.
- Files: `src/app/api/schema.d.ts`, `http-context.ts`, `auth-api.ts`, `auth-api.spec.ts`, `models.spec.ts`, `src/testing/session.ts`

### T2. `SessionService`: fin de la sesión y `refresh()`
- Acceptance:
  - La sesión guarda `refreshToken` y `refreshExpiraEn`; `start()` y la lectura de `sessionStorage` (`toSession`) los aceptan, y una sesión guardada sin esos campos (de antes de esta corrección) se lee con los dos en `null`.
  - El fin de la sesión es `refreshExpiraEn ?? expiraEn`; lo usan `isActive()`, `isExpired()` y la lectura al arrancar.
  - `accessExpired()`: `expiraEn` menos 30 segundos ya pasó.
  - `refresh()` devuelve `RefreshResult` (`'renewed' | 'ended' | 'unavailable'`), con una sola renovación a la vez; reemplaza el token, `expiraEn`, `refreshToken` y `refreshExpiraEn`, y conserva el nombre; descarta la respuesta si la sesión terminó o se reemplazó mientras tanto. Reconoce el `ApiError` con `isApiError()` (riesgo del plan).
  - `refresh()` no descarta la sesión ni navega: eso lo deciden los interceptores y `logout()`.
- Verify: las pruebas de `SessionService` de la tabla de la spec, salvo la pestaña duplicada (T3). La del `401` pasa por los interceptores reales.
- Files: `src/app/core/session/session-service.ts`, `session-service.spec.ts`

### T3. Pestaña duplicada
- Acceptance:
  - La sesión guardada lleva `tabOpen`. Al crear el servicio: si la sesión guardada tiene `tabOpen: true`, se descarta sin aviso (`ended()` sigue en `false`); si no, se conserva y se marca `true`.
  - `pagehide` guarda `tabOpen: false` y `pageshow` con `persisted` lo vuelve a `true`. Los escuchas se registran con la ventana de `DOCUMENT`, no con `window` global.
  - Una sesión guardada sin `tabOpen` (de antes de esta corrección) se trata como cerrada: se conserva.
- Verify: pruebas: copia con `tabOpen: true` → sin sesión; recarga (tras `pagehide`) → con sesión; vuelta desde el historial (`pageshow` con `persisted`) → `tabOpen: true` otra vez; sin sesión, los eventos no escriben nada.
- Files: `src/app/core/session/session-service.ts`, `session-service.spec.ts`

### T4. Interceptores
- Acceptance:
  - `tokenInterceptor`: con `NO_SESSION`, no agrega el token. Con `session.accessExpired()` y refresh token, espera `refresh()` y envía con el token que haya después (nuevo si renovó, el viejo si no).
  - `errorInterceptor`: el `401` de una petición con token, con la sesión activa y sin la marca de repetición, llama a `refresh()`. Con `'renewed'`, repite una vez con el token nuevo y la marca. Con `'ended'`, RFF-03 con una sola navegación. Con `'unavailable'`, no descarta la sesión ni navega y entrega el error de la renovación. La repetida con `401`, RFF-03.
  - Lo demás de §3.5 sin cambios: el `401` sin token no navega y el `403 RN-24` abre `V-03`.
- Verify: las pruebas de `tokenInterceptor` y `errorInterceptor` de la tabla de la spec, incluidas los tres `401` simultáneos (una renovación) y la petición con el token vencido (una sola llamada a `/auth/refresh`).
- Files: `src/app/core/http/token-interceptor.ts`, `token-interceptor.spec.ts`, `error-interceptor.ts`, `error-interceptor.spec.ts`

### T5. Cierre de sesión y documentos
- Acceptance:
  - `logout()`: si `accessExpired()` y hay refresh token, espera `refresh()` antes de enviar `POST /auth/logout`. Después, como hoy: descarta la sesión, ignora el error del logout y abre `/oferta?aviso=sesion-cerrada`.
  - Guardas: una prueba nueva de `authGuard` y otra de `guestGuard` con el token de acceso vencido y la sesión vigente (entra a la vista protegida; el invitado va al inicio del rol).
  - Documentos, según el punto 7 de la spec:
    - `docs/requerimientos.md`: línea de estado, §1.3, RFF-03, RFF-04, §6 y glosario.
    - `docs/arquitectura.md`: §4.1, §4.2, §4.3, §4.5 y §9.
    - `AGENTS.md`: el refresh token en *Nunca*.
    - `specs/mapa-modulos.md`: una decisión nueva (la sesión se renueva con el refresh token, de la API `sesiones`) y la fila heredada de `acceso` (con una sesión real: un formulario sigue funcionando después de que vence el token de acceso, sin el aviso de RFF-03; el `401` con un token invalidado desde otro dispositivo aplica RFF-03 después de intentar renovar).
- Verify: pruebas de `logout()` (renueva y luego cierra con el token nuevo; si la renovación falla, igual descarta y navega) y de las guardas. Lectura de los documentos: ninguno dice ya que la API no tiene refresh token ni que el token dura 60 minutos.
- Files: `src/app/core/session/session-service.ts`, `session-service.spec.ts`, `src/app/core/guards/guards.spec.ts`, `docs/requerimientos.md`, `docs/arquitectura.md`, `AGENTS.md`, `specs/mapa-modulos.md`

### T6. Verificación manual y cierre
- Acceptance:
  - User-secrets de la API (supuesto 2): se revisa si existen `Jwt:AccessTokenMinutes` y `Jwt:RefreshTokenMinutes` sin imprimir los demás valores; se fijan en `1` y `3`; se reinicia la API. Al terminar quedan **como estaban** (se quitan si no existían) y se reinicia la API otra vez.
  - Los cuatro puntos manuales de la spec, con una sesión de `POST /auth/login` (usuarios de `datos-prueba`) escrita en `sessionStorage`: logout con el token vencido (`/auth/refresh` `200` y luego `/auth/logout` `204`), sesión descartada después de 3 minutos, pestaña duplicada sin sesión y la original con sesión, y el refresh token solo en el cuerpo de `/auth/refresh`, sin aparecer en la consola.
  - `pnpm format:check && pnpm lint && pnpm test --watch=false && pnpm build` y `pnpm audit` sin errores. La carga inicial no crece más de 5 kB respecto de T1.
  - Revisión de los 6 criterios de éxito, anotada aquí. Spec y mapa con la corrección completada; el pull request a `main` lo abre el usuario.
- Verify: los resultados de cada punto, anotados en esta tarea, y la confirmación de que los user-secrets volvieron a su estado.
- Files: `tasks/sesiones/todo.md`, `specs/SPEC-sesiones.md`, `specs/mapa-modulos.md`
