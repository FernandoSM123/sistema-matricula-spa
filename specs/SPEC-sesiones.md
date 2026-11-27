# Spec: sesiones

Corrección transversal antes de `componentes`, como [`nombres`](SPEC-nombres.md). No es un módulo del [mapa](mapa-modulos.md): adapta lo que construyó `nucleo` (sesión, interceptores y cierre de sesión) al módulo [`sesiones` de la API](../../sistema-matricula-api/specs/SPEC-sesiones.md), que agregó el refresh token (RF-60, RN-50 a RN-52). Ese módulo fija solo el contrato y deja los cambios del SPA a esta spec ("Fuera de alcance", último punto).

| Estado | Plan | Tareas | Avance |
|---|---|---|---|
| **Aprobada** | [Aprobado](../tasks/sesiones/plan.md) | [Aprobadas](../tasks/sesiones/todo.md) | 6/6 tareas completadas. Corrección completada |

**Historial:**
- 2026-11-26: v1 en revisión, en la rama `sesiones`. Parte de la revisión de los módulos `nombres` y `sesiones` de la API, a pedido del usuario. Las decisiones 3 (pestaña duplicada) y 4 (el cierre de sesión renueva primero) son recomendaciones que el usuario pidió y que esperan su aprobación.
- 2026-11-26: v1 aprobada por el usuario, que aprueba las decisiones 3 y 4 y el supuesto 2 (acortar las vigencias en los user-secrets de la API para la verificación manual y dejarlas como estaban al terminar). Plan y tareas en revisión.
- 2026-11-26: plan y tareas aprobados. Empieza T1.
- 2026-11-26: T1 completada. No previsto: entre los 32 esquemas renombrados está `PerfilResponse`, que pasa a `ProfileResponse`; su alias de `models.ts` toma el nombre nuevo (§3.2 de la arquitectura). Se adelanta de T2 el guardado de `refreshToken` y `refreshExpiraEn`, sin el cual `SessionService` no compilaba.
- 2026-11-26: T2 completada: el fin de la sesión, `accessExpired()` y `refresh()`. Detalle no previsto: un contador de la sesión (`generation`), que no cambia al renovar, reemplaza la comparación por identidad para descartar las respuestas tardías de `GET /me` y de la renovación.
- 2026-11-26: T3 completada: la pestaña duplicada empieza sin sesión (marca `tabOpen`, decisión 3).
- 2026-11-26: T4 completada: los dos interceptores renuevan. Cambios a la spec: cuando la renovación no está disponible, `refresh()` ya no devuelve el texto `'unavailable'` sino el `ApiError` de la renovación, que es el error que el punto 5 pide entregar (puntos 3 y 5 y la tabla de pruebas actualizados). `SessionService` agrega `canRefresh()`, para que `tokenInterceptor` envíe sin esperar cuando no hay nada que renovar.
- 2026-11-26: T5 completada: el cierre de sesión renueva primero si el token venció, y si la renovación falla no llama al logout (fallaría igual); las guardas con el token vencido; requerimientos, arquitectura, `AGENTS.md` y el mapa (decisión 6 y verificación heredada de `acceso`).
- 2026-11-26: T6 completada: la verificación manual con las vigencias acortadas en los user-secrets de la API, que quedaron como estaban, y los comandos de cierre. Los 6 criterios de éxito se cumplen (revisión en T6 del `todo.md`). Corrección completada, en la rama `sesiones`; el pull request a `main` lo abre el usuario.

## Objetivo

Hoy el token dura 60 minutos y no se renueva: al vencer, el SPA descarta la sesión y abre `V-02`, aunque el usuario esté a mitad de un formulario (RFF-03). La API ahora entrega junto al token de acceso un **refresh token**: el token de acceso dura 15 minutos y la sesión, hasta 8 horas desde el inicio de sesión (RN-50). Con esta corrección, el SPA **renueva el token sin que el usuario lo note** y repite la petición. Solo cuando la sesión ya no se puede renovar se aplica RFF-03 como hasta ahora.

**Usuarios:** administradores, profesores y estudiantes con sesión. Quien ingresa con una temporal no recibe refresh token (RN-52): su sesión dura lo que su token de acceso, 15 minutos, y solo sirve para el cambio obligatorio.

**Contrato de la API** (de su `SPEC-sesiones`):
- `TokenResponse` agrega `refreshToken: string | null` y `refreshExpiraEn: string | null`. Los dos son `null` en el login con temporal. Lo devuelven el login, el cambio obligatorio, cambiar contraseña y la renovación.
- `POST /auth/refresh` con `{ refreshToken }`: anónimo, responde `200` con un `TokenResponse` nuevo. El refresh token anterior deja de servir (RN-51) y `refreshExpiraEn` no cambia (RN-50).
- Todos los rechazos dan el mismo `401` con `code: "RF-60"`. Usar un refresh token ya reemplazado termina esa sesión (RN-51). Logout, cambio de contraseña y desactivación impiden renovar (RN-52).
- Límite de 30 renovaciones por minuto por IP (`429` con `Retry-After`).

### Alcance

1. **Tipos.** Regenerar `src/app/api/schema.d.ts` con `pnpm api:types`. Trae también los 32 esquemas renombrados por la corrección `nombres` de la API (su §2.6). Entre ellos, `PerfilResponse` pasa a `ProfileResponse`, y su alias de `models.ts` toma el nombre nuevo (T1). Los alias de los requests los agrega cada módulo con el nombre nuevo (por ejemplo, `acceso` usará `RequiredPasswordChangeRequest`).

2. **`AuthApi.refresh(refreshToken)`**: `POST /auth/refresh`, marcada con un `HttpContextToken` de `api/` (`NO_SESSION`), para que `tokenInterceptor` no le agregue el token de acceso y `errorInterceptor` no la trate como una petición con sesión.

3. **`SessionService`:**
   - Guarda `refreshToken` y `refreshExpiraEn` junto a los datos de hoy, en la misma clave `matricula.session`. `start()` los toma de la respuesta.
   - **El fin de la sesión** es `refreshExpiraEn`, o `expiraEn` si no hay refresh token (temporal). `isActive()`, `isExpired()` y la lectura al arrancar usan ese instante. Con el token de acceso vencido y la sesión vigente, la sesión sigue activa: las guardas no cambian.
   - **`refresh()`** renueva con `AuthApi.refresh` y devuelve `'renewed'`, `'ended'` (la API respondió `401`, o no hay refresh token) o, si la renovación no está disponible (sin respuesta, `429` o `5xx`), el `ApiError` de la renovación. **Una sola renovación a la vez por pestaña:** las llamadas que llegan mientras tanto reciben la misma promesa. Con `'renewed'` reemplaza el token, `expiraEn` y el refresh token, y conserva el nombre (no vuelve a pedir `GET /me`). Si la sesión terminó o se reemplazó mientras tanto, descarta la respuesta.
   - **`accessExpired()`**: `expiraEn` ya pasó o pasa en menos de 30 segundos (margen para la latencia y una diferencia pequeña de reloj).
   - **Pestaña duplicada** (decisión 3): al duplicar una pestaña, el navegador copia su `sessionStorage`, y las dos quedarían con el mismo refresh token; la primera que renueva deja a la otra con uno ya reemplazado, y la API termina la sesión **en las dos** (RN-51). Para evitarlo, la sesión guarda la marca `tabOpen`: `true` mientras la pestaña está abierta, `false` en `pagehide` y de nuevo `true` en `pageshow`. Si al arrancar la marca ya está en `true`, el almacenamiento es una copia de una pestaña abierta: la sesión se descarta sin aviso y la pestaña empieza sin sesión, como una pestaña nueva (§4.1 de la arquitectura: cada pestaña inicia su propia sesión). La pestaña original no se ve afectada.

4. **`tokenInterceptor`:** si `session.accessExpired()` y la sesión tiene refresh token (`canRefresh()`), espera `session.refresh()` antes de enviar la petición, así no la envía con un token que la API va a rechazar. Con `'ended'` o un error la envía igual, y la respuesta sigue el camino de siempre. No toca las peticiones con `NO_SESSION`.

5. **`errorInterceptor`**, ante un `401` de una petición que llevaba token y con la sesión todavía activa:
   - Llama a `session.refresh()`.
   - Con `'renewed'`: repite la petición **una vez** con el token nuevo. Repetirla es seguro, también en un `POST`: un `401` significa que la API la rechazó antes de ejecutarla. Si la repetición vuelve a dar `401`, aplica RFF-03.
   - Con `'ended'`: RFF-03 como hoy (descarta la sesión y abre `V-02` con `volver` y el aviso), una sola navegación aunque fallen varias peticiones a la vez.
   - Con un `ApiError` (no disponible): no descarta la sesión. La petición original falla con el error de la renovación (sin respuesta, `429` o `5xx`), que el componente presenta según §3.5. La siguiente petición intenta renovar de nuevo.
   - El `401` de la propia renovación no lo ve como petición con sesión (no lleva token): lo resuelve `refresh()`.

6. **Cierre de sesión (RFF-04)** (decisión 4): si el token de acceso venció y hay refresh token, `logout()` renueva primero y luego envía `POST /auth/logout` con el token nuevo. Así el cierre llega a la API y termina las sesiones de los demás dispositivos, como promete el aviso de RFF-04. Si la renovación falla, sigue como hoy: descarta la sesión local y abre `V-01` con el aviso.

7. **Documentos:**
   - `docs/requerimientos.md`:
     - §1.3: la renovación del token sale de "Fuera del alcance"; queda fuera solo el aviso antes de que termine la sesión de 8 horas.
     - RFF-03: el token se renueva sin intervención del usuario (RF-60); la sesión termina a las 8 horas, al cerrarse en otro dispositivo, al cambiar la contraseña o al desactivarse la cuenta; una pestaña duplicada empieza sin sesión.
     - RFF-04: renueva antes de cerrar si el token venció.
     - §6, seguridad en el cliente: el refresh token sigue las mismas reglas que el token.
     - El glosario ("Sesión terminada") y la línea de estado.
   - `docs/arquitectura.md`:
     - §4.1: los datos nuevos de la sesión, el fin de la sesión, la renovación, la pestaña duplicada y el porqué de `sessionStorage` sin la frase "la API no tiene refresh token".
     - §4.2: la renovación en los dos interceptores y `NO_SESSION`.
     - §4.3: "vencida" pasa a significar "terminada según `refreshExpiraEn`".
     - §4.5: el refresh token, igual que el token.
     - §9: los casos nuevos de las pruebas.
   - `specs/mapa-modulos.md`: el historial, una decisión y la verificación heredada de `acceso` con la renovación.
   - `AGENTS.md`: la regla del token en *Nunca* incluye el refresh token.

### Lo que no cambia
- Las guardas, sus rutas y sus avisos: siguen leyendo `isActive()`, `isExpired()` y `passwordChangePending()`.
- El aviso de RFF-03 ("Su sesión terminó. Inicie sesión de nuevo") y la ruta `volver`.
- El modelo de una sesión por pestaña, guardada en `sessionStorage` bajo una sola clave.
- La API: esta corrección no la toca (decisión 4 del mapa).

### Fuera de alcance
- **Renovar con un temporizador**, sin que haya peticiones: no hace falta, porque la sesión dura hasta `refreshExpiraEn` aunque el token de acceso venza, y la siguiente petición renueva.
- **Aviso antes de que termine la sesión de 8 horas**, con la opción de guardar: sigue fuera del alcance (§1.3 de los requerimientos).
- **Compartir la sesión entre pestañas** (por ejemplo, con `BroadcastChannel`): rompe "cada pestaña su sesión" y es frágil con pestañas suspendidas, que no reciben los mensajes y luego reusarían un refresh token viejo (decisión 3).
- **Cerrar solo la sesión de esta pestaña:** la API cierra todas las de la cuenta (fuera del alcance de su `SPEC-sesiones`).
- **Las vistas:** `V-02`, `V-03` y `V-07` las construye `acceso`, que guarda las sesiones con `start()`, ya con los campos nuevos.

## Tech Stack

Sin cambios ni dependencias nuevas. `HttpContextToken` es de `@angular/common/http`; `pagehide` y `pageshow`, del navegador.

## Commands

```bash
pnpm api:types                   # con la API en marcha en http://localhost:5022
pnpm format:check && pnpm lint && pnpm test --watch=false && pnpm build
pnpm audit
pnpm start                       # verificación manual
```

## Project Structure

```
src/app/api/schema.d.ts                       (regenerado)
src/app/api/auth-api.ts                       (+ refresh)
src/app/api/http-context.ts                   (NO_SESSION; nuevo)
src/app/core/session/session-service.ts       (campos nuevos, fin de la sesión, refresh(), accessExpired(), tabOpen)
src/app/core/http/token-interceptor.ts        (renueva antes de enviar)
src/app/core/http/error-interceptor.ts        (renueva ante el 401 y repite)
*.spec.ts junto a cada uno
docs/requerimientos.md, docs/arquitectura.md, specs/mapa-modulos.md, AGENTS.md
```

## Code Style

```ts
// core/session/session-service.ts
export type RefreshResult = 'renewed' | 'ended' | ApiError; // ApiError: la renovación no está disponible

/** RF-60: una sola renovación a la vez por pestaña; las llamadas de mientras tanto esperan la misma. */
refresh(): Promise<RefreshResult> {
  this.refreshing ??= this.renew().finally(() => (this.refreshing = null));
  return this.refreshing;
}

private async renew(): Promise<RefreshResult> {
  const session = this.session();
  if (session?.refreshToken == null) return 'ended';
  try {
    const response = await firstValueFrom(this.authApi.refresh(session.refreshToken));
    // La sesión pudo terminar (cierre) o reemplazarse (cambio de contraseña) mientras tanto.
    if (this.session() !== session) return this.session() === null ? 'ended' : 'renewed';
    this.session.set({ ...session, ...tokensOf(response) });
    return 'renewed';
  } catch (error) {
    const apiError = isApiError(error) ? error : toApiError(error);
    return apiError.status === 401 ? 'ended' : apiError;
  }
}
```

```ts
// core/http/error-interceptor.ts (extracto)
if (error.status === 401 && sentWithToken && session.token() !== null && !isRetry) {
  return from(session.refresh()).pipe(
    switchMap((result) => {
      if (result === 'renewed') return next(withToken(request, session.token()!, { isRetry: true }));
      if (result === 'ended') endSession(); // RFF-03, una sola navegación
      return throwError(() => error);
    }),
  );
}
```

El código final puede diferir; lo que fija la spec es el comportamiento. Nombres según §10.1: los datos de la API en español (`refreshToken`, `refreshExpiraEn`), lo técnico en inglés (`refresh()`, `RefreshResult`, `NO_SESSION`, `tabOpen`).

## Testing Strategy

**Unitarias** (Vitest, junto al código, con `HttpTestingController` y el reloj de `CLOCK`):

| Pieza | Casos |
|---|---|
| `SessionService` | Guarda y lee `refreshToken` y `refreshExpiraEn`. Al arrancar, conserva una sesión con el token de acceso vencido y `refreshExpiraEn` vigente, y descarta la que pasó `refreshExpiraEn`. Sin refresh token (temporal), el fin es `expiraEn`. `refresh()`: `'renewed'` reemplaza el token y conserva el nombre; `401` da `'ended'`; sin respuesta, `429` y `500` dan su `ApiError`; dos llamadas a la vez hacen **una** petición; si la sesión terminó durante la renovación, la respuesta se descarta. `accessExpired()` en el margen de 30 s. Pestaña duplicada: con `tabOpen` en `true` al arrancar, descarta la sesión; después de `pagehide` (recarga), la conserva |
| `tokenInterceptor` | Con el token de acceso vencido, renueva y envía con el token nuevo. Sin refresh token, envía con el viejo. No agrega el token a `NO_SESSION` ni a otro origen |
| `errorInterceptor` | `401` → renueva → repite una vez con el token nuevo y entrega su respuesta. Repetición con `401` → RFF-03. Renovación `'ended'` → RFF-03. Tres `401` a la vez → una renovación, tres repeticiones; si falla, una navegación. Renovación no disponible → no descarta la sesión ni navega, y el error es el de la renovación. El `401` sin token sigue sin navegar; el `403 RN-24`, igual que hoy |
| `logout()` | Con el token vencido, renueva y envía el logout con el token nuevo. Si la renovación falla, descarta la sesión y navega igual |
| Guardas | Las pruebas actuales siguen en verde. Una sesión con el token de acceso vencido y la sesión vigente entra a una vista protegida |

**Manual**, con la API en marcha. Sin `V-02` (la construye `acceso`), la sesión se crea con `POST /auth/login` desde `Matricula.Api.http` y se escribe en `sessionStorage` desde las herramientas del navegador, con `Jwt:AccessTokenMinutes = 1` y `Jwt:RefreshTokenMinutes = 3` en los user-secrets de la API (supuesto 2):
- Pasado 1 minuto, recargar y cerrar sesión: el logout sale con un token renovado (`200` de `/auth/refresh` y luego `204`) y la consola de la API no registra un `401`.
- Pasados 3 minutos, recargar: la sesión se descarta.
- Duplicar la pestaña: la copia empieza sin sesión y la original la conserva.
- En la pestaña de red: el refresh token solo va en el cuerpo de `/auth/refresh`, nunca en la dirección, y no aparece en la consola.

La prueba de punta a punta (un formulario que sigue funcionando después de 15 minutos, el `401` con un token invalidado desde otro dispositivo) pasa a la verificación heredada de `acceso`, que tiene las primeras vistas que consultan la API con sesión.

## Boundaries

- **Siempre:**
  - El refresh token sigue las reglas del token: solo en `sessionStorage` (a través de `SessionService`) y en el cuerpo de `/auth/refresh`; nunca en la dirección, en la consola, en un mensaje de error ni en otro origen.
  - Una sola renovación a la vez por pestaña.
  - Commit por tarea, con el `todo.md`, esta spec y el mapa.
- **Preguntar antes:**
  - Cambiar el margen de 30 segundos, la forma de detectar la pestaña duplicada o qué errores de la renovación terminan la sesión.
  - Cambiar los user-secrets de la API más allá de las dos claves del supuesto 2.
- **Nunca:**
  - Modificar la API.
  - Repetir una petición más de una vez, o renovar con un refresh token que ya se envió (la API terminaría la sesión, RN-51).
  - Guardar la sesión fuera de `sessionStorage` o en más de una clave.

## Success Criteria

1. `schema.d.ts` regenerado: `TokenResponse` trae `refreshToken` y `refreshExpiraEn` anulables, y existe `/api/v1/auth/refresh`.
2. Todas las pruebas de la tabla en verde, y `pnpm format:check`, `pnpm lint`, `pnpm build` y `pnpm audit` sin errores. La carga inicial no crece más de 5 kB.
3. Con el token de acceso vencido y la sesión vigente, ninguna petición termina en RFF-03: se renueva y se repite.
4. RFF-03 se aplica solo cuando la sesión no se puede renovar, con una sola navegación.
5. La verificación manual da el resultado esperado en sus cuatro puntos.
6. `docs/requerimientos.md`, `docs/arquitectura.md`, `AGENTS.md` y el mapa describen el comportamiento nuevo, y la verificación heredada de `acceso` incluye la renovación.

## Supuestos

1. **Sin respuesta, `429` o `5xx` en la renovación no terminan la sesión.** Pueden ser pasajeros, y la sesión todavía puede renovarse. Si la API sí rotó el token pero la respuesta se perdió, el siguiente intento usa el token viejo y la API termina la sesión (supuesto 2 de la `SPEC-sesiones` de la API): es raro y es el lado seguro.
2. **La verificación manual acorta las vigencias** en los user-secrets de la API (`Jwt:AccessTokenMinutes = 1`, `Jwt:RefreshTokenMinutes = 3`), como hizo la API en su verificación, y al terminar las deja como estaban. Es configuración del entorno local, no un cambio de la API (aprobado por el usuario, 2026-11-26).
3. **La marca `tabOpen` también descarta la sesión** si el navegador se cierra de golpe (sin `pagehide`) y luego restaura la pestaña, o si el sistema del celular la descarta y la recarga. El usuario inicia sesión de nuevo. Es el lado seguro.
4. **No hay versión nueva del SPA** por esta corrección, como en `nombres`: sigue `0.2.0`.

## Decisiones

1. **Es una corrección, no un módulo del mapa**, como `nombres`: cambia piezas de `nucleo` ya completadas. Id `sesiones`, el mismo del módulo de la API.
2. **Se renueva al necesitarlo, no con un temporizador:** antes de enviar si el token venció (punto 4) y ante un `401` (punto 5). El `401` cubre lo que el reloj no ve: una diferencia de reloj o una sesión invalidada.
3. **La pestaña duplicada empieza sin sesión** (2026-11-26, aprobada por el usuario). Alternativas descartadas:
   - *Aceptar el riesgo:* duplicar una pestaña terminaría la sesión en las dos a los 15 minutos, sin explicación para el usuario.
   - *Compartir el refresh token con `BroadcastChannel`:* contradice "cada pestaña su sesión" y falla con pestañas suspendidas.
   - *Conservar en la copia solo el token de acceso:* la copia funcionaría hasta 15 minutos y luego mostraría RFF-03 sin motivo visible.
4. **El cierre de sesión renueva primero si el token venció** (2026-11-26, aprobada por el usuario). Sin eso, un logout con el token vencido falla con `401` y las sesiones de los demás dispositivos siguen abiertas, aunque RFF-04 informa que se cerraron. Es una petición más, solo en ese caso. Coincide con el supuesto 6 de la `SPEC-sesiones` de la API.

## Preguntas abiertas

Ninguna.
