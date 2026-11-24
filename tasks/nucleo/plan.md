# Plan: nucleo

Módulo `nucleo` del [mapa](../../specs/mapa-modulos.md). Spec: [`specs/SPEC-nucleo.md`](../../specs/SPEC-nucleo.md) · Tareas: [`todo.md`](todo.md)

**Estado del plan:** Aprobado (2026-11-24). En T1, COR-03 de la API reemplazó al tipo utilitario de los números (decisión 4 de la spec), y la carga inicial bajó a 302 kB, lo que deja margen para el marco de T6 (decisión 5)

## Enfoque

El orden sigue las dependencias de §2.3: primero `api/`, que no depende de nada; después la sesión, que usa `api/`; los interceptores y las guardas, que usan la sesión; y al final lo visible (rutas, páginas y marco), que usa todo lo anterior.

Las piezas de lógica (paginación, conversión a `ErrorApi`, sesión, interceptores y guardas) se escriben con las pruebas primero: sus casos ya están fijados en §3.5, §4 y §9 de la arquitectura. Lo visible se prueba en lo que tiene lógica (la lista del menú por rol, el pie) y se verifica a mano contra los wireframes.

Cada tarea termina con:
- `pnpm lint`, `pnpm test --watch=false` y `pnpm build` en verde;
- su verificación;
- un commit en la rama `nucleo` (decisión 5 del mapa).

## Componentes y orden

| # | Componente | Depende de | Notas |
|---|---|---|---|
| 1 | **Contrato con la API:** `openapi-typescript`, `pnpm api:tipos`, `esquema.d.ts`, `modelos.ts` con el tipo utilitario de los números, `api-url.ts` y `paginacion.ts`. También los documentos: B-06 y los cambios del mapa (decisiones 1 a 3 de la spec) | — | Necesita la API en marcha. Sin lógica de Angular todavía |
| 2 | **Sesión:** `SesionService`, `auth-api.ts` (`cerrarSesion`) y `me-api.ts` (`obtenerPerfil`) | 1 | Única pieza con `sessionStorage` |
| 3 | **Interceptores:** `error-api.ts` (interfaz y conversión), `tokenInterceptor`, `erroresInterceptor` y su registro en `app.config.ts`, con `API_URL` | 1, 2 | El `401` usa `SesionService.terminar()` |
| 4 | **Guardas:** `sesionGuard`, `invitadoGuard`, `cambioPendienteGuard`, `rolGuard`, `rutaVolverSegura()` y la página de inicio por rol | 2 | Funciones puras sobre la sesión, fáciles de probar con `TestBed` |
| 5 | **Rutas y páginas:** `app.routes.ts` con `/`, `/sin-permiso` y `**`; `V-09` y `V-10`; se borra la página de muestra | 4 | Desde aquí la aplicación arranca sin la muestra |
| 6 | **Marco:** barra superior, menú lateral por rol, menú de la cuenta, variante del visitante y del cambio pendiente, y pie | 2, 4, 5 | La pieza más visible; se revisa contra los wireframes |
| 7 | **Cierre:** verificación manual con sesión real, navegadores, Lighthouse, `pnpm audit`, versión `0.2.0` y criterios de éxito | 1 a 6 | Cierra el módulo y deja el PR listo |

Nada se hace en paralelo: el proyecto lo construye una sola persona y cada tarea usa la anterior.

## Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| `openapi-typescript` 7.13 avisa que espera TypeScript 5 (§1) y pnpm puede rechazar el par por `peerDependencies` | En T1 de la arquitectura generó bien con TypeScript 6. Si pnpm falla por el par, se detiene y se pregunta antes de tocar `peerDependencyRules` |
| El tipo utilitario de los números se vuelve complejo o lento con tipos recursivos grandes | Se aplica alias por alias, no al esquema entero, y una prueba de tipos (`expectTypeOf` de Vitest) comprueba `number` en un id, un opcional (`number \| null`) y un arreglo anidado |
| El `401` de `POST /auth/logout` (sesión ya vencida) dispara la navegación de RFF-03 en lugar de la de RFF-04 | `cerrarSesion()` descarta la sesión antes de esperar la respuesta, y el interceptor solo navega si al recibir el `401` todavía hay sesión. Hay una prueba para este caso |
| Varias peticiones fallan con `401` a la vez y navegan varias veces | Mismo mecanismo: la primera termina la sesión y las demás ya no la encuentran. Prueba con dos `401` seguidos |
| `httpResource` o `HttpClient` reciben un error que no es `ErrorApi` (por ejemplo, el tiempo agotado) | La conversión cubre `HttpErrorResponse` con `status: 0` y el error de tiempo agotado. Pruebas para los dos |
| El marco con `mat-sidenav`, `mat-menu` y `BreakpointObserver` supera el presupuesto de la carga inicial | Imports por componente (§8.3) y `V-09`/`V-10` en diferido. Se mira el tamaño del build en T6 y se mide con Lighthouse en T7 |
| Sin `V-02`, es difícil armar una sesión real para la verificación manual | Se pide un token a `POST /auth/login` con curl, con los usuarios de `datos-prueba` del backend, y se escribe la clave `matricula.sesion` en `sessionStorage` (supuesto 5 de la spec). El JSON de ejemplo queda en `todo.md` |

## Puntos de verificación

- **Después de T1:** `pnpm api:tipos` regenera sin diferencias, y la prueba de tipos de `modelos.ts` pasa.
- **Después de T3:** las pruebas de sesión e interceptores cubren todas las filas de §3.5 que les tocan.
- **Después de T5:** `pnpm start` ya no muestra la página de muestra; `/x` muestra `V-10`.
- **Después de T7:** se cumplen los 9 criterios de éxito de la spec, y el usuario revisa el marco.

## Fuera de este plan

- Lo que la spec deja fuera de su alcance: las vistas de `acceso` y `oferta`, la presentación de los errores y `cambiosSinGuardarGuard` (de `componentes`).
- Firefox y Safari, heredados por `sistema` (decisión 2 de la spec).
