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
| T1. Contrato y `AuthApi.refresh()` | Completada | ✅ | ✅ | ✅ | ✅ |
| T2. `SessionService`: fin de la sesión y `refresh()` | Completada | ✅ | ✅ | ➖ | ✅ |
| T3. Pestaña duplicada | Completada | ✅ | ✅ | ➖ | ✅ |
| T4. Interceptores | Completada | ✅ | ✅ | ➖ | ✅ |
| T5. Cierre de sesión y documentos | Completada | ✅ | ✅ | ➖ | ✅ |
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
- **Resultado (2026-11-26):**
  - `schema.d.ts` regenerado, y `pnpm api:types` genera el mismo archivo dos veces seguidas. Esquemas: 73 antes y 74 ahora. Salen los 32 nombres viejos y entran los 32 nuevos, más `RefreshTokenRequest`. Con los renombres aplicados al archivo anterior, lo único distinto es lo de RF-60: `refreshToken` y `refreshExpiraEn` (`null | string`) en `TokenResponse` y la ruta `/api/v1/auth/refresh` con sus respuestas `200`, `400`, `401` y `429`.
  - **No previsto en la spec:** entre los 32 renombres está `PerfilResponse` → `ProfileResponse` (también `MensajeResponse` → `MessageResponse` y `ReenvioTemporalResponse` → `ResendTemporaryPasswordResponse`, que el SPA todavía no usa). El alias de `models.ts` lleva el nombre del esquema (§3.2 de la arquitectura), así que pasa a `ProfileResponse` en `models.ts`, `me-api.ts`, `models.spec.ts` y `src/testing/session.ts`. Ningún documento lo nombraba.
  - `models.ts` agrega el alias `RefreshTokenRequest`, que usa `AuthApi.refresh()` con `satisfies`.
  - **Adelantado de T2:** con `TokenResponse` ampliado, `SessionService` no compilaba. Por eso ya guarda `refreshToken` y `refreshExpiraEn` en `start()`, y la lectura al arrancar los acepta: los dos con valor o los dos en `null`, y una sesión guardada sin ellos se lee con `null`. Tiene 4 pruebas nuevas. El fin de la sesión, `accessExpired()` y `refresh()` siguen en T2.
  - **Carga inicial:** 438,44 kB antes de T1 (punto de partida del criterio 2) y 438,79 kB después.
  - `pnpm format:check`, `pnpm lint`, `pnpm test --watch=false` (21 archivos, 204 pruebas) y `pnpm build` en verde.

### T2. `SessionService`: fin de la sesión y `refresh()`
- Acceptance:
  - ~~La sesión guarda `refreshToken` y `refreshExpiraEn`; `start()` y la lectura de `sessionStorage` (`toSession`) los aceptan, y una sesión guardada sin esos campos (de antes de esta corrección) se lee con los dos en `null`.~~ Hecho en T1.
  - El fin de la sesión es `refreshExpiraEn ?? expiraEn`; lo usan `isActive()`, `isExpired()` y la lectura al arrancar.
  - `accessExpired()`: `expiraEn` menos 30 segundos ya pasó.
  - `refresh()` devuelve `RefreshResult` (`'renewed' | 'ended' | 'unavailable'`), con una sola renovación a la vez; reemplaza el token, `expiraEn`, `refreshToken` y `refreshExpiraEn`, y conserva el nombre; descarta la respuesta si la sesión terminó o se reemplazó mientras tanto. Reconoce el `ApiError` con `isApiError()` (riesgo del plan).
  - `refresh()` no descarta la sesión ni navega: eso lo deciden los interceptores y `logout()`.
- Verify: las pruebas de `SessionService` de la tabla de la spec, salvo la pestaña duplicada (T3). La del `401` pasa por los interceptores reales.
- Files: `src/app/core/session/session-service.ts`, `session-service.spec.ts`
- **Resultado (2026-11-26):**
  - `isActive()`, `isExpired()` y la lectura al arrancar usan el fin de la sesión (`refreshExpiraEn ?? expiraEn`). `accessExpired()` usa `ACCESS_MARGIN` (30 s).
  - `refresh()` devuelve `RefreshResult` y comparte una sola promesa mientras dura la renovación. Un `401` da `'ended'`; sin respuesta, `429` y `5xx` dan `'unavailable'`. Sin refresh token o con la sesión terminada, da `'ended'` sin hacer la petición.
  - **Detalle no previsto en la spec:** para saber si la sesión "terminó o se reemplazó mientras tanto", el servicio lleva un contador `generation` que cambia con `start()` y `end()`, pero no con una renovación. Antes, `start()` comparaba la sesión por identidad: ahora usa el mismo contador. Así, una renovación que llega mientras `GET /me` está en curso no impide poner el nombre, y el nombre que llega durante una renovación no se pierde. Hay una prueba para cada caso.
  - Pruebas de guardas y de `homeRoute`: sus casos de "sesión vencida" ahora hacen pasar `refreshExpiraEn`, que es el nuevo significado de vencida (§4.3). Se renombraron a "terminada".
  - **Pasa a T4:** con los interceptores reales, la renovación todavía sale con el token de acceso, porque `tokenInterceptor` aún no lee `NO_SESSION`. Esa verificación queda en las pruebas de T4. La prueba de T2 con los interceptores reales comprueba que el `401` da `'ended'` y el `500`, `'unavailable'` (riesgo de `isApiError()` del plan).
  - **Carga inicial:** 439,52 kB (+1,08 kB desde el punto de partida de T1).
  - `pnpm format:check`, `pnpm lint`, `pnpm test --watch=false` (21 archivos, 223 pruebas) y `pnpm build` en verde.

### T3. Pestaña duplicada
- Acceptance:
  - La sesión guardada lleva `tabOpen`. Al crear el servicio: si la sesión guardada tiene `tabOpen: true`, se descarta sin aviso (`ended()` sigue en `false`); si no, se conserva y se marca `true`.
  - `pagehide` guarda `tabOpen: false` y `pageshow` con `persisted` lo vuelve a `true`. Los escuchas se registran con la ventana de `DOCUMENT`, no con `window` global.
  - Una sesión guardada sin `tabOpen` (de antes de esta corrección) se trata como cerrada: se conserva.
- Verify: pruebas: copia con `tabOpen: true` → sin sesión; recarga (tras `pagehide`) → con sesión; vuelta desde el historial (`pageshow` con `persisted`) → `tabOpen: true` otra vez; sin sesión, los eventos no escriben nada.
- Files: `src/app/core/session/session-service.ts`, `session-service.spec.ts`
- **Resultado (2026-11-26):**
  - `tabOpen` se guarda en la misma clave `matricula.session`, junto a la sesión. No es parte de la sesión en memoria: lo agrega `write()`.
  - Al arrancar, la sesión que se conserva se escribe en el acto con `tabOpen: true`, sin esperar al `effect`. Así, una pestaña duplicada justo después de abrir la original ya trae la marca. La copia se descarta con `write(null)` y sin `end()`, así que `ended()` sigue en `false` y no hay aviso.
  - Los escuchas de `pagehide` y `pageshow` se registran sobre la ventana de `DOCUMENT` y se quitan con `DestroyRef`. En las pruebas, `TestBed` crea un servicio por prueba sobre la misma `window`, y sin quitarlos los servicios viejos escribirían sus sesiones. Hay una prueba para eso.
  - En las pruebas, `stored()` devuelve la sesión sin la marca, y `raw()` el JSON completo, para las pruebas de la pestaña.
  - 8 pruebas nuevas. La prueba con una pestaña duplicada de verdad queda para la verificación manual de T6.
  - **Carga inicial:** 440,06 kB (+1,62 kB desde el punto de partida de T1).
  - `pnpm format:check`, `pnpm lint`, `pnpm test --watch=false` (21 archivos, 231 pruebas) y `pnpm build` en verde.

### T4. Interceptores
- Acceptance:
  - `tokenInterceptor`: con `NO_SESSION`, no agrega el token. Con `session.accessExpired()` y refresh token, espera `refresh()` y envía con el token que haya después (nuevo si renovó, el viejo si no).
  - `errorInterceptor`: el `401` de una petición con token, con la sesión activa y sin la marca de repetición, llama a `refresh()`. Con `'renewed'`, repite una vez con el token nuevo y la marca. Con `'ended'`, RFF-03 con una sola navegación. Con `'unavailable'`, no descarta la sesión ni navega y entrega el error de la renovación. La repetida con `401`, RFF-03.
  - Lo demás de §3.5 sin cambios: el `401` sin token no navega y el `403 RN-24` abre `V-03`.
- Verify: las pruebas de `tokenInterceptor` y `errorInterceptor` de la tabla de la spec, incluidas los tres `401` simultáneos (una renovación) y la petición con el token vencido (una sola llamada a `/auth/refresh`).
- Files: `src/app/core/http/token-interceptor.ts`, `token-interceptor.spec.ts`, `error-interceptor.ts`, `error-interceptor.spec.ts`
- **Resultado (2026-11-26):**
  - **Cambio de `refresh()` (T2):** si la renovación no está disponible, devuelve el `ApiError` de la renovación en lugar del texto `'unavailable'`. El punto 5 de la spec pide que la petición falle con ese error, y así llega sin guardar estado aparte en el servicio. `RefreshResult` es `'renewed' | 'ended' | ApiError`, y se ajustaron sus 3 pruebas de T2 y la spec.
  - **`SessionService.canRefresh()`**, no previsto: la sesión no terminó y tiene refresh token. `tokenInterceptor` lo usa para enviar en el acto, sin esperar una promesa, cuando no hay nada que renovar (temporal).
  - `tokenInterceptor`: con `NO_SESSION` o a otro origen, pasa la petición sin tocarla. Con el token vencido y `canRefresh()`, espera `refresh()` (con `defer`, al suscribirse) y envía con el token que haya en ese momento.
  - `errorInterceptor`: una función `handle()` que se llama a sí misma para la repetición, así el error de la repetida también pasa por `toApiError` y por RFF-03. La marca `RETRIED` (un `HttpContextToken` privado del archivo) va en una **copia** del `HttpContext`: quien hizo la petición puede reusar el mismo contexto en otras, y marcar el original impediría renovarlas. Hay una prueba para eso. La navegación de RFF-03 queda en `endSession()`, que solo navega si todavía hay sesión.
  - Pruebas: 4 nuevas en `tokenInterceptor` (incluida la renovación sin `Authorization`, que pasó de T2) y 10 nuevas o reescritas en `errorInterceptor`. Las dos de RFF-03 que ya existían ahora responden primero la renovación con `401 RF-60`. `src/testing/problem-details.ts` agrega `PROBLEM_401_RF60`.
  - **Carga inicial:** 440,83 kB (+2,39 kB desde el punto de partida de T1).
  - `pnpm format:check`, `pnpm lint`, `pnpm test --watch=false` (21 archivos, 243 pruebas) y `pnpm build` en verde.

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
- **Resultado (2026-11-26):**
  - `logout()`: con `accessExpired()` y `canRefresh()`, espera `refresh()`. **Detalle no previsto:** si la renovación no da `'renewed'`, no envía `POST /auth/logout`. Fallaría igual con el token vencido, y además `tokenInterceptor` intentaría renovar otra vez antes de enviarlo (otros 30 s de espera si la API no responde). En todos los casos descarta la sesión y abre `/oferta?aviso=sesion-cerrada`, como pide la spec. Hay 4 pruebas nuevas: renueva y cierra con el token nuevo, la renovación falla, temporal sin renovar y token vigente sin renovar.
  - Guardas: `authGuard` deja pasar a `/mi-perfil` con el token de acceso vencido y la sesión vigente, sin el aviso; `guestGuard` manda a la página de inicio del rol.
  - Documentos:
    - `docs/requerimientos.md`: línea de estado, §1.3, §2.5 (la fila y el párrafo de la sesión invalidada), RFF-03 (renovación, temporal y pestaña duplicada), RFF-04, la fila del `401` de RUI-03, §6 y el glosario.
    - `docs/arquitectura.md`: línea de estado, §2.2 (`http-context.ts`, `session/` y `http/`), la fila del `401` de §3.5, §4.1 (reescrita: los datos, el fin de la sesión, la renovación y la pestaña duplicada), §4.2 (reescrita), §4.3, §4.5 y la tabla de §9.
    - `AGENTS.md`: el refresh token en *Nunca*.
    - Mapa: la decisión 6 y la verificación heredada de `acceso` con la renovación.
  - Búsqueda: ni los requerimientos ni la arquitectura dicen ya que la API no tiene refresh token o que la sesión dura 60 minutos. Solo los conservan los documentos históricos (specs y tareas de `fundacion`, `nucleo` y la fase 0).
  - `pnpm format:check`, `pnpm lint`, `pnpm test --watch=false` (21 archivos, 249 pruebas) y `pnpm build` en verde.

### T6. Verificación manual y cierre
- Acceptance:
  - User-secrets de la API (supuesto 2): se revisa si existen `Jwt:AccessTokenMinutes` y `Jwt:RefreshTokenMinutes` sin imprimir los demás valores; se fijan en `1` y `3`; se reinicia la API. Al terminar quedan **como estaban** (se quitan si no existían) y se reinicia la API otra vez.
  - Los cuatro puntos manuales de la spec, con una sesión de `POST /auth/login` (usuarios de `datos-prueba`) escrita en `sessionStorage`: logout con el token vencido (`/auth/refresh` `200` y luego `/auth/logout` `204`), sesión descartada después de 3 minutos, pestaña duplicada sin sesión y la original con sesión, y el refresh token solo en el cuerpo de `/auth/refresh`, sin aparecer en la consola.
  - `pnpm format:check && pnpm lint && pnpm test --watch=false && pnpm build` y `pnpm audit` sin errores. La carga inicial no crece más de 5 kB respecto de T1.
  - Revisión de los 6 criterios de éxito, anotada aquí. Spec y mapa con la corrección completada; el pull request a `main` lo abre el usuario.
- Verify: los resultados de cada punto, anotados en esta tarea, y la confirmación de que los user-secrets volvieron a su estado.
- Files: `tasks/sesiones/todo.md`, `specs/SPEC-sesiones.md`, `specs/mapa-modulos.md`
