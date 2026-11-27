# Plan: sesiones

Corrección `sesiones`, previa a `componentes` (ver el [mapa](../../specs/mapa-modulos.md)). Spec: [`specs/SPEC-sesiones.md`](../../specs/SPEC-sesiones.md) · Tareas: [`todo.md`](todo.md)

**Estado del plan:** Aprobado (2026-11-26)

## Enfoque

Se sigue el camino de los datos: primero el contrato (`api/`), después la sesión que lo guarda, luego los interceptores que la usan, y al final el cierre de sesión y los documentos. Toda la lógica nueva tiene sus casos fijados en la tabla de pruebas de la spec, así que cada pieza se escribe **con las pruebas primero**: la prueba falla, se implementa y pasa.

No hay vistas nuevas. Lo visible (que no aparezca el aviso de RFF-03 al vencer el token) se verifica a mano en T6, con las vigencias acortadas en la API, y de punta a punta en `acceso`.

Cada tarea termina con:
- `pnpm format:check`, `pnpm lint`, `pnpm test --watch=false` y `pnpm build` en verde;
- su verificación;
- un commit en la rama `sesiones` (decisión 5 del mapa).

## Componentes y orden

| # | Componente | Depende de | Notas |
|---|---|---|---|
| 1 | **Contrato:** `schema.d.ts` regenerado, `api/http-context.ts` (`NO_SESSION`), `AuthApi.refresh()` y los datos de prueba de `src/testing/session.ts` con los campos nuevos. Medir la carga inicial de partida | — | Necesita la API en marcha |
| 2 | **`SessionService`:** los campos nuevos, el fin de la sesión, `accessExpired()` y `refresh()` con una sola renovación a la vez | 1 | El centro de la corrección |
| 3 | **Pestaña duplicada:** la marca `tabOpen`, `pagehide` y `pageshow` | 2 | Separada de T2 porque cambia la lectura al arrancar y tiene sus propios casos |
| 4 | **Interceptores:** `tokenInterceptor` renueva antes de enviar; `errorInterceptor` renueva ante el `401` y repite una vez | 2 | `NO_SESSION` evita que la renovación se renueve a sí misma |
| 5 | **Cierre de sesión y documentos:** `logout()` renueva primero; las pruebas de las guardas con el token vencido; requerimientos, arquitectura, `AGENTS.md` y el mapa | 2, 4 | Los documentos van al final, cuando el comportamiento ya está probado |
| 6 | **Verificación manual y cierre:** user-secrets acortados y luego restaurados, los cuatro puntos manuales, `pnpm audit`, la carga inicial y los criterios de éxito | 1 a 5 | Deja el PR listo |

Nada va en paralelo: lo construye una sola persona y cada tarea usa la anterior. T3 y T4 no dependen entre sí, pero se mantiene el orden.

## Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| El error de `AuthApi.refresh()` llega a `renew()` ya convertido en `ApiError` por `errorInterceptor`, y `toApiError()` sobre un `ApiError` da `status: 0`: un `401` se leería como `'unavailable'` y la sesión nunca terminaría | `renew()` usa `isApiError()` antes de convertir. Hay una prueba con el `401` pasando por los interceptores reales (`provideHttpClient(withInterceptors(...))`) |
| La renovación pasa por `tokenInterceptor` y, con el token vencido, espera otra renovación: un bloqueo | `NO_SESSION` en `AuthApi.refresh()`, y los dos interceptores dejan pasar esas peticiones sin tocarlas. Prueba: con el token vencido, una petición hace exactamente una llamada a `/auth/refresh` |
| Varias peticiones a la vez renuevan varias veces y la API termina la sesión por reuso (RN-51) | La promesa compartida de `refresh()`. Prueba con tres `401` simultáneos: una sola petición a `/auth/refresh` |
| La repetición de una petición entra en bucle si la API vuelve a responder `401` | Marca de repetición en la petición clonada (un `HttpContextToken` interno de `core/http`): la repetida no renueva otra vez y aplica RFF-03 |
| `pagehide` y `pageshow` no se disparan solos en jsdom | Las pruebas despachan los eventos sobre `window` (`new PageTransitionEvent` o `Event` con `persisted`) y crean el servicio después de preparar `sessionStorage` |
| `logout()` descarta la sesión antes de la respuesta; si renueva primero, una renovación que tarda podría dejar al usuario sin respuesta visible | Se espera la renovación con el mismo tiempo de espera de 30 s de las peticiones (§3.1), y pase lo que pase se descarta la sesión y se navega |
| La regeneración de `schema.d.ts` trae otros cambios del OpenAPI, además de los 32 renombres y el refresh token | Se revisa el diff de `schema.d.ts` en T1: solo deben cambiar nombres de esquemas, `TokenResponse`, `RefreshTokenRequest` y la ruta nueva. Si aparece algo más, se detiene y se pregunta |
| Los user-secrets de la API guardan `Jwt:Key`, y listarlos lo mostraría | En T6 se revisa solo si existen las dos claves, filtrando por su nombre sin imprimir valores. Si no existían, al terminar se quitan con `dotnet user-secrets remove`; si existían, se anotan sus valores y se restauran |

## Puntos de verificación

- **Después de T1:** `pnpm api:types` dos veces seguidas no deja diferencias, y el diff de `schema.d.ts` es el esperado.
- **Después de T4:** todas las filas de la tabla de pruebas de la spec de `SessionService` y de los interceptores en verde.
- **Después de T6:** se cumplen los 6 criterios de éxito, y los user-secrets de la API quedan como estaban.

## Fuera de este plan

- Lo que la spec deja fuera de su alcance: el temporizador, el aviso antes de las 8 horas, compartir la sesión entre pestañas y las vistas de `acceso`.
- La prueba de punta a punta con un formulario, heredada por `acceso`.
